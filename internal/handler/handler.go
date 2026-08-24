package handler

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/labstack/echo/v5"
)

type ErrorPayload struct {
	RequestID string `json:"requestId"`
	Code      int    `json:"code"`
	Message   string `json:"message"`
}

func ErrorHandler(logger *slog.Logger) echo.HTTPErrorHandler {
	return func(c *echo.Context, err error) {
		if response, _ := echo.UnwrapResponse(c.Response()); response != nil && response.Committed {
			return
		}

		code := echo.StatusCode(err)
		if code == 0 {
			code = http.StatusInternalServerError
		}

		message := http.StatusText(code)

		var httpError *echo.HTTPError
		if errors.As(err, &httpError) && httpError.Message != "" {
			message = httpError.Message
		}

		if code >= 500 && logger != nil {
			logger.Error("request failed", "error", err, "request_id", c.Response().Header().Get(echo.HeaderXRequestID))
		}

		_ = c.JSON(code, ErrorPayload{
			RequestID: c.Response().Header().Get(echo.HeaderXRequestID),
			Code:      code,
			Message:   message,
		})
	}
}
