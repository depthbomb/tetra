package user

import (
	"context"
	"errors"
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"

	"go-tetra/internal/middleware/apikey"
	authservice "go-tetra/internal/service/auth"
	userservice "go-tetra/internal/service/user"
)

type Service interface {
	ListPublic(context.Context) ([]userservice.PublicUser, error)
	GetAPIKeyInfo(context.Context, uuid.UUID) (userservice.APIKeyInfo, error)
	RegenerateAPIKey(context.Context, uuid.UUID) (uuid.UUID, error)
}

type SessionManager interface {
	ReadSession(*http.Request) (authservice.Session, error)
	SetSession(http.ResponseWriter, authservice.Session) error
}

type Handler struct {
	service  Service
	sessions SessionManager
}

func New(service Service, sessions SessionManager) *Handler {
	return &Handler{service: service, sessions: sessions}
}

func (h *Handler) List(c *echo.Context) error {
	users, err := h.service.ListPublic(c.Request().Context())
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, users)
}

func (h *Handler) APIKeyInfo(c *echo.Context) error {
	principal, ok := apikey.Current(c)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "API key is required")
	}
	info, err := h.service.GetAPIKeyInfo(c.Request().Context(), principal.UserID)
	if err != nil {
		return userError(err)
	}

	return c.JSON(http.StatusOK, info)
}

func (h *Handler) RegenerateAPIKey(c *echo.Context) error {
	principal, ok := apikey.Current(c)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "API key is required")
	}

	newAPIKey, err := h.service.RegenerateAPIKey(c.Request().Context(), principal.UserID)
	if err != nil {
		return userError(err)
	}

	if h.sessions != nil {
		if session, err := h.sessions.ReadSession(c.Request()); err == nil && session.APIKey == principal.APIKey {
			session.APIKey = newAPIKey
			if err := h.sessions.SetSession(c.Response(), session); err != nil {
				return err
			}
		}
	}

	return c.JSON(http.StatusOK, map[string]uuid.UUID{"apiKey": newAPIKey})
}

func userError(err error) error {
	switch {
	case errors.Is(err, userservice.ErrAPIKeyCooldown):
		return echo.NewHTTPError(http.StatusForbidden, "API key cannot be regenerated yet").Wrap(err)
	default:
		return err
	}
}
