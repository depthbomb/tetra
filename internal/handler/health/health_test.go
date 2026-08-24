package health

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v5"
)

type readinessStub struct{ err error }

func (s readinessStub) Ping(context.Context) error { return s.err }

func TestHealthAndReadiness(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		path       string
		readyErr   error
		wantStatus int
	}{
		{name: "health", path: "/health", wantStatus: http.StatusNoContent},
		{name: "ready", path: "/ready", wantStatus: http.StatusNoContent},
		{name: "not ready", path: "/ready", readyErr: errors.New("offline"), wantStatus: http.StatusServiceUnavailable},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			e := echo.New()
			handler := New(readinessStub{err: tt.readyErr})
			e.Any("/health", handler.Health)
			e.Any("/ready", handler.Ready)
			recorder := httptest.NewRecorder()
			e.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, tt.path, nil))
			if recorder.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d; body=%s", recorder.Code, tt.wantStatus, recorder.Body.String())
			}
		})
	}
}
