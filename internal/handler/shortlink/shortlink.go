package shortlink

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/depthbomb/duration"
	"github.com/google/uuid"
	"github.com/labstack/echo/v5"

	"go-tetra/internal/middleware/apikey"
	shortlinkservice "go-tetra/internal/service/shortlink"
)

type Service interface {
	Create(context.Context, shortlinkservice.CreateInput) (shortlinkservice.Created, error)
	Get(context.Context, string) (shortlinkservice.Public, error)
	ListForUser(context.Context, uuid.UUID) ([]shortlinkservice.Owned, error)
	ListAll(context.Context) ([]shortlinkservice.Admin, error)
	Delete(context.Context, string, string) error
	Available(context.Context, string) (bool, error)
	SetExpiry(context.Context, string, string, time.Duration) (time.Time, error)
	Toggle(context.Context, string) (bool, error)
	Resolve(context.Context, string) (string, error)
	CreateQRCode(context.Context, string) ([]byte, error)
}

type Handler struct {
	service Service
}

type createBody struct {
	Destination string `json:"destination"`
	Shortcode   string `json:"shortcode,omitempty"`
	Duration    string `json:"duration,omitempty"`
}

type setExpiryBody struct {
	Duration string `json:"duration"`
}

func New(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) List(c *echo.Context) error {
	principal, ok := apikey.Current(c)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "API key is required")
	}
	result, err := h.service.ListForUser(c.Request().Context(), principal.UserID)
	return jsonResult(c, http.StatusOK, result, err)
}

func (h *Handler) ListAll(c *echo.Context) error {
	result, err := h.service.ListAll(c.Request().Context())
	return jsonResult(c, http.StatusOK, result, err)
}

func (h *Handler) Create(c *echo.Context) error {
	var body createBody
	if err := decodeJSON(c, &body); err != nil {
		return err
	}

	var ttl time.Duration
	if body.Duration != "" {
		var err error
		ttl, err = parseDuration(body.Duration)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "duration must contain a recognized duration such as 15m, 2 days, or 1 week")
		}
	}

	var creatorID *uuid.UUID
	if principal, ok := apikey.Current(c); ok {
		creatorID = &principal.UserID
	}

	result, err := h.service.Create(c.Request().Context(), shortlinkservice.CreateInput{
		CreatorIP:   c.RealIP(),
		Destination: body.Destination,
		Shortcode:   body.Shortcode,
		CreatorID:   creatorID,
		TTL:         ttl,
	})
	return jsonResult(c, http.StatusCreated, result, err)
}

func (h *Handler) Available(c *echo.Context) error {
	available, err := h.service.Available(c.Request().Context(), c.Param("shortcode"))
	return jsonResult(c, http.StatusOK, map[string]bool{"available": available}, err)
}

func (h *Handler) SetExpiry(c *echo.Context) error {
	var body setExpiryBody
	if err := decodeJSON(c, &body); err != nil {
		return err
	}
	ttl, err := parseDuration(body.Duration)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "duration must contain a recognized duration such as 15m, 2 days, or 1 week")
	}
	expiresAt, err := h.service.SetExpiry(c.Request().Context(), c.Param("shortcode"), c.Param("secret"), ttl)
	return jsonResult(c, http.StatusOK, map[string]time.Time{"expiresAt": expiresAt}, err)
}

func (h *Handler) Toggle(c *echo.Context) error {
	disabled, err := h.service.Toggle(c.Request().Context(), c.Param("shortcode"))
	return jsonResult(c, http.StatusOK, map[string]bool{"disabled": disabled}, err)
}

func (h *Handler) Delete(c *echo.Context) error {
	err := h.service.Delete(c.Request().Context(), c.Param("shortcode"), c.Param("secret"))
	return jsonResult(c, http.StatusOK, map[string]bool{"success": err == nil}, err)
}

func (h *Handler) Get(c *echo.Context) error {
	result, err := h.service.Get(c.Request().Context(), c.Param("shortcode"))
	return jsonResult(c, http.StatusOK, result, err)
}

func (h *Handler) Redirect(c *echo.Context) error {
	shortcode := c.Param("shortcode")
	if infoShortcode, ok := strings.CutSuffix(shortcode, "+"); ok && infoShortcode != "" {
		return c.Redirect(http.StatusFound, "/shortlink/"+url.PathEscape(infoShortcode))
	}

	destination, err := h.service.Resolve(c.Request().Context(), shortcode)
	if err != nil {
		return HTTPError(err)
	}

	return c.Redirect(http.StatusFound, destination)
}

func (h *Handler) GetQRCode(c *echo.Context) error {
	shortcode := c.Param("shortcode")
	qrBytes, err := h.service.CreateQRCode(c.Request().Context(), shortcode)
	if err != nil {
		return HTTPError(err)
	}

	c.Response().Header().Set("Cache-Control", "public, max-age=86400")
	return c.Blob(http.StatusOK, "image/svg+xml", qrBytes)
}

func parseDuration(value string) (time.Duration, error) {
	parsed, err := duration.Parse(value)
	if err != nil {
		return 0, err
	}

	return parsed.Value(), nil
}

func decodeJSON(c *echo.Context, target any) error {
	decoder := json.NewDecoder(http.MaxBytesReader(c.Response(), c.Request().Body, 1<<20))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(target); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid JSON body").Wrap(err)
	}
	if err := decoder.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		return echo.NewHTTPError(http.StatusBadRequest, "request body must contain one JSON object")
	}

	return nil
}

func jsonResult(c *echo.Context, status int, value any, err error) error {
	if err != nil {
		return HTTPError(err)
	}

	return c.JSON(status, value)
}

func HTTPError(err error) error {
	switch {
	case errors.Is(err, shortlinkservice.ErrInvalidInput):
		return echo.NewHTTPError(http.StatusBadRequest, err.Error()).Wrap(err)
	case errors.Is(err, shortlinkservice.ErrNotFound):
		return echo.NewHTTPError(http.StatusNotFound, "shortlink not found").Wrap(err)
	case errors.Is(err, shortlinkservice.ErrConflict):
		return echo.NewHTTPError(http.StatusConflict, "shortcode is already in use").Wrap(err)
	default:
		return fmt.Errorf("shortlink request: %w", err)
	}
}
