package apikey

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
)

func TestRequired(t *testing.T) {
	t.Parallel()

	key := uuid.New()
	userID := uuid.New()
	auth := New(func(_ context.Context, candidate uuid.UUID) (Principal, bool, error) {
		return Principal{UserID: userID, APIKey: candidate}, candidate == key, nil
	})
	e := echo.New()
	e.GET("/", func(c *echo.Context) error {
		principal, ok := Current(c)
		if !ok || principal.UserID != userID {
			t.Fatal("authenticated principal was not stored in context")
		}
		return c.NoContent(http.StatusNoContent)
	}, auth.Required)

	for _, test := range []struct {
		name   string
		key    string
		status int
	}{
		{name: "missing", status: http.StatusUnauthorized},
		{name: "malformed", key: "nope", status: http.StatusUnauthorized},
		{name: "unknown", key: uuid.NewString(), status: http.StatusUnauthorized},
		{name: "valid", key: key.String(), status: http.StatusNoContent},
	} {
		t.Run(test.name, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			request := httptest.NewRequest(http.MethodGet, "/", nil)
			request.Header.Set("X-Api-Key", test.key)
			e.ServeHTTP(recorder, request)
			if recorder.Code != test.status {
				t.Fatalf("status = %d, want %d", recorder.Code, test.status)
			}
		})
	}
}

func TestOptionalAndAdmin(t *testing.T) {
	t.Parallel()

	key := uuid.New()
	auth := New(func(context.Context, uuid.UUID) (Principal, bool, error) {
		return Principal{APIKey: key}, true, nil
	})
	e := echo.New()
	e.GET("/optional", func(c *echo.Context) error { return c.NoContent(http.StatusNoContent) }, auth.Optional)
	e.GET("/admin", func(c *echo.Context) error { return c.NoContent(http.StatusNoContent) }, auth.RequiredAdmin)

	optional := httptest.NewRecorder()
	e.ServeHTTP(optional, httptest.NewRequest(http.MethodGet, "/optional", nil))
	if optional.Code != http.StatusNoContent {
		t.Fatalf("optional status = %d, want %d", optional.Code, http.StatusNoContent)
	}

	admin := httptest.NewRecorder()
	e.ServeHTTP(admin, httptest.NewRequest(http.MethodGet, "/admin?apiKey="+key.String(), nil))
	if admin.Code != http.StatusForbidden {
		t.Fatalf("admin status = %d, want %d", admin.Code, http.StatusForbidden)
	}
}

func TestLookupFailureDoesNotAuthorize(t *testing.T) {
	t.Parallel()

	auth := New(func(context.Context, uuid.UUID) (Principal, bool, error) {
		return Principal{}, false, errors.New("database unavailable")
	})
	e := echo.New()
	e.GET("/", func(c *echo.Context) error { return c.NoContent(http.StatusNoContent) }, auth.Required)
	recorder := httptest.NewRecorder()
	e.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/?apiKey="+uuid.NewString(), nil))
	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusInternalServerError)
	}
}
