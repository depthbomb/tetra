package spa

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"testing/fstest"

	"github.com/labstack/echo/v5"
)

func TestServe(t *testing.T) {
	t.Parallel()

	handler, err := newHandler(fstest.MapFS{
		"index.html":    {Data: []byte("spa")},
		"assets/app.js": {Data: []byte("javascript")},
	})
	if err != nil {
		t.Fatalf("new handler: %v", err)
	}

	tests := []struct {
		name       string
		path       string
		wantStatus int
		wantBody   string
	}{
		{name: "root route", path: "/", wantStatus: http.StatusOK, wantBody: "spa"},
		{name: "history route", path: "/admin/users", wantStatus: http.StatusOK, wantBody: "spa"},
		{name: "existing asset", path: "/assets/app.js", wantStatus: http.StatusOK, wantBody: "javascript"},
		{name: "asset directory", path: "/assets", wantStatus: http.StatusNotFound},
		{name: "missing asset", path: "/assets/missing.js", wantStatus: http.StatusNotFound},
		{name: "missing static file", path: "/robots.txt", wantStatus: http.StatusNotFound},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			e := echo.New()
			e.GET("/*", handler.Serve)
			recorder := httptest.NewRecorder()
			e.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, tt.path, nil))
			if recorder.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d; body=%s", recorder.Code, tt.wantStatus, recorder.Body.String())
			}
			if tt.wantBody != "" && recorder.Body.String() != tt.wantBody {
				t.Fatalf("body = %q, want %q", recorder.Body.String(), tt.wantBody)
			}
		})
	}
}

func TestNewRequiresIndex(t *testing.T) {
	t.Parallel()

	if _, err := newHandler(fstest.MapFS{}); err == nil {
		t.Fatal("newHandler returned nil error")
	}
}
