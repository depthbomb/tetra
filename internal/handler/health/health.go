package health

import (
	"context"
	"net/http"

	"github.com/labstack/echo/v5"
)

type DatabasePinger interface {
	Ping(context.Context) error
}

type Handler struct {
	readiness DatabasePinger
}

func New(readiness DatabasePinger) *Handler {
	return &Handler{readiness: readiness}
}

func (h *Handler) Health(c *echo.Context) error {
	return c.NoContent(http.StatusNoContent)
}

func (h *Handler) Ready(c *echo.Context) error {
	if err := h.readiness.Ping(c.Request().Context()); err != nil {
		return echo.NewHTTPError(http.StatusServiceUnavailable, "database unavailable").Wrap(err)
	}

	return c.NoContent(http.StatusNoContent)
}
