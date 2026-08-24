package apikey

import (
	"context"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
)

const principalContextKey = "go-tetra.api-key-principal"

// Principal is the authenticated identity made available to HTTP handlers.
type Principal struct {
	UserID uuid.UUID
	APIKey uuid.UUID
	Admin  bool
}

// Lookup resolves an API key. A false found value represents invalid credentials; an error represents an operational
// failure and must not authorize the request.
type Lookup func(context.Context, uuid.UUID) (principal Principal, found bool, err error)

type Middleware struct {
	lookup Lookup
}

func New(lookup Lookup) *Middleware {
	return &Middleware{lookup: lookup}
}

func (m *Middleware) Required(next echo.HandlerFunc) echo.HandlerFunc {
	return m.authenticate(next, false, false)
}

func (m *Middleware) Optional(next echo.HandlerFunc) echo.HandlerFunc {
	return m.authenticate(next, true, false)
}

func (m *Middleware) RequiredAdmin(next echo.HandlerFunc) echo.HandlerFunc {
	return m.authenticate(next, false, true)
}

func (m *Middleware) authenticate(next echo.HandlerFunc, optional, adminOnly bool) echo.HandlerFunc {
	return func(c *echo.Context) error {
		value := c.QueryParam("apiKey")
		if value == "" {
			value = c.Request().Header.Get("X-Api-Key")
		}
		if value == "" {
			if optional {
				return next(c)
			}
			return echo.NewHTTPError(http.StatusUnauthorized, "API key is required")
		}

		key, err := uuid.Parse(value)
		if err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid API key").Wrap(err)
		}
		principal, found, err := m.lookup(c.Request().Context(), key)
		if err != nil {
			return fmt.Errorf("authenticate API key: %w", err)
		}
		if !found {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid API key")
		}
		if adminOnly && !principal.Admin {
			return echo.NewHTTPError(http.StatusForbidden, "admin access required")
		}

		c.Set(principalContextKey, principal)

		return next(c)
	}
}

func Current(c *echo.Context) (Principal, bool) {
	principal, ok := c.Get(principalContextKey).(Principal)
	return principal, ok
}
