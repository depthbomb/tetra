package auth

import (
	"context"
	"errors"
	"net/http"

	"github.com/labstack/echo/v5"

	authservice "go-tetra/internal/service/auth"
	userservice "go-tetra/internal/service/user"
)

type Authenticator interface {
	Begin(http.ResponseWriter) (string, error)
	Complete(context.Context, *http.Request) (authservice.Identity, error)
	SetSession(http.ResponseWriter, authservice.Session) error
	ReadSession(*http.Request) (authservice.Session, error)
	ClearState(http.ResponseWriter)
	ClearSession(http.ResponseWriter)
}

type UserService interface {
	UpsertOIDC(context.Context, userservice.OIDCIdentity) (userservice.AuthenticatedUser, error)
}

type Handler struct {
	auth  Authenticator
	users UserService
}

func New(auth Authenticator, users UserService) *Handler {
	return &Handler{auth: auth, users: users}
}

func (h *Handler) Start(c *echo.Context) error {
	authorizationURL, err := h.auth.Begin(c.Response())
	if err != nil {
		return err
	}
	return c.Redirect(http.StatusFound, authorizationURL)
}

func (h *Handler) Callback(c *echo.Context) error {
	h.auth.ClearState(c.Response())
	identity, err := h.auth.Complete(c.Request().Context(), c.Request())
	if errors.Is(err, authservice.ErrInvalidState) {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid or expired OIDC state").Wrap(err)
	}
	if errors.Is(err, authservice.ErrInvalidToken) {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid OIDC token").Wrap(err)
	}
	if err != nil {
		return err
	}
	c.Logger().DebugContext(
		c.Request().Context(),
		"authenticated OIDC user info",
		"claims", string(identity.RawClaims),
	)

	user, err := h.users.UpsertOIDC(c.Request().Context(), userservice.OIDCIdentity{
		Subject: identity.Subject, Username: identity.Username, Email: identity.Email, Admin: identity.Admin,
	})
	if err != nil {
		return err
	}
	session := authservice.Session{
		Subject: user.Subject, Username: user.Username, Avatars: user.Avatars, Admin: user.Admin, APIKey: user.APIKey,
	}
	if err := h.auth.SetSession(c.Response(), session); err != nil {
		return err
	}

	return c.Redirect(http.StatusFound, "/")
}

func (h *Handler) Session(c *echo.Context) error {
	session, err := h.auth.ReadSession(c.Request())
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "not authenticated")
	}

	return c.JSON(http.StatusOK, session)
}

func (h *Handler) Logout(c *echo.Context) error {
	h.auth.ClearSession(c.Response())
	return c.NoContent(http.StatusNoContent)
}
