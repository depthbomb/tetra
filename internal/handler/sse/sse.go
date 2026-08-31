package sse

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/labstack/echo/v5"
)

const (
	defaultPollInterval      = 5 * time.Second
	defaultHeartbeatInterval = 15 * time.Second
)

type Service interface {
	Count(context.Context) (int, error)
}

type Handler struct {
	service           Service
	pollInterval      time.Duration
	heartbeatInterval time.Duration
}

func New(service Service) *Handler {
	return &Handler{
		service:           service,
		pollInterval:      defaultPollInterval,
		heartbeatInterval: defaultHeartbeatInterval,
	}
}

func (h *Handler) Stream(c *echo.Context) error {
	ctx := c.Request().Context()
	count, err := h.service.Count(ctx)
	if err != nil {
		return fmt.Errorf("read initial shortlink count: %w", err)
	}

	response := c.Response()
	response.Header().Set(echo.HeaderContentType, "text/event-stream")
	response.Header().Set(echo.HeaderCacheControl, "no-cache")
	response.Header().Set("X-Accel-Buffering", "no")
	response.WriteHeader(http.StatusOK)
	if err := writeCount(response, count); err != nil {
		return streamError(ctx, err)
	}

	poll := time.NewTicker(h.pollInterval)
	heartbeat := time.NewTicker(h.heartbeatInterval)
	defer poll.Stop()
	defer heartbeat.Stop()

	for {
		select {
		case <-ctx.Done():
			return nil
		case <-poll.C:
			current, err := h.service.Count(ctx)
			if err != nil {
				return streamError(ctx, fmt.Errorf("refresh shortlink count: %w", err))
			}
			if current == count {
				continue
			}

			count = current
			if err := writeCount(response, count); err != nil {
				return streamError(ctx, err)
			}
		case <-heartbeat.C:
			if err := writeEvent(response, ": heartbeat\n\n"); err != nil {
				return streamError(ctx, err)
			}
		}
	}
}

func writeCount(response http.ResponseWriter, count int) error {
	return writeEvent(response, fmt.Sprintf("event: shortlink-count\ndata: {\"count\":%d}\n\n", count))
}

func writeEvent(response http.ResponseWriter, event string) error {
	if _, err := response.Write([]byte(event)); err != nil {
		return fmt.Errorf("write server-sent event: %w", err)
	}
	if err := http.NewResponseController(response).Flush(); err != nil {
		return fmt.Errorf("flush server-sent event: %w", err)
	}

	return nil
}

func streamError(ctx context.Context, err error) error {
	if ctx.Err() != nil {
		return nil
	}

	return err
}
