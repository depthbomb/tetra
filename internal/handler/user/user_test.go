package user

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"

	commonhandler "go-tetra/internal/handler"
	"go-tetra/internal/middleware/apikey"
	userservice "go-tetra/internal/service/user"
)

type serviceStub struct {
	users       []userservice.PublicUser
	info        userservice.APIKeyInfo
	regenerated uuid.UUID
	err         error
}

func (s serviceStub) ListPublic(context.Context) ([]userservice.PublicUser, error) {
	return s.users, s.err
}

func (s serviceStub) GetAPIKeyInfo(context.Context, uuid.UUID) (userservice.APIKeyInfo, error) {
	return s.info, s.err
}

func (s serviceStub) RegenerateAPIKey(context.Context, uuid.UUID) (uuid.UUID, error) {
	return s.regenerated, s.err
}

func TestList(t *testing.T) {
	t.Parallel()

	apiKey := uuid.New()
	e := newTestEcho(serviceStub{users: []userservice.PublicUser{{Username: "tetra", Avatar: "avatar", Admin: true}}})
	recorder := httptest.NewRecorder()
	e.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/v1/users?apiKey="+apiKey.String(), nil))

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200; body=%s", recorder.Code, recorder.Body.String())
	}
	var response []userservice.PublicUser
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if len(response) != 1 || response[0].Username != "tetra" {
		t.Fatalf("response = %#v", response)
	}
}

func TestListRejectsInvalidAPIKey(t *testing.T) {
	t.Parallel()

	e := newTestEcho(serviceStub{})
	recorder := httptest.NewRecorder()
	e.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/v1/users?apiKey=nope", nil))

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want 401; body=%s", recorder.Code, recorder.Body.String())
	}
	if recorder.Header().Get(echo.HeaderXRequestID) == "" {
		t.Fatal("missing X-Request-Id header")
	}
}

func TestAPIKeyInfo(t *testing.T) {
	t.Parallel()

	apiKey := uuid.New()
	e := newTestEcho(serviceStub{info: userservice.APIKeyInfo{CanRegenerate: true}})
	recorder := httptest.NewRecorder()
	e.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/v1/users/api-key-info?apiKey="+apiKey.String(), nil))

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200; body=%s", recorder.Code, recorder.Body.String())
	}
	var response userservice.APIKeyInfo
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if !response.CanRegenerate {
		t.Fatal("CanRegenerate = false, want true")
	}
}

func TestRegenerateAPIKey(t *testing.T) {
	t.Parallel()

	oldAPIKey, newAPIKey := uuid.New(), uuid.New()
	e := newTestEcho(serviceStub{regenerated: newAPIKey})
	request := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/users/regenerate-api-key?apiKey="+oldAPIKey.String(),
		nil,
	)
	recorder := httptest.NewRecorder()
	e.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200; body=%s", recorder.Code, recorder.Body.String())
	}
	var response struct {
		APIKey uuid.UUID `json:"apiKey"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if response.APIKey != newAPIKey {
		t.Fatalf("APIKey = %s, want %s", response.APIKey, newAPIKey)
	}
}

func newTestEcho(service Service) *echo.Echo {
	e := echo.New()
	e.HTTPErrorHandler = commonhandler.ErrorHandler(nil)
	e.Pre(middleware.RequestID())
	handler := New(service, nil)
	auth := apikey.New(func(_ context.Context, key uuid.UUID) (apikey.Principal, bool, error) {
		return apikey.Principal{UserID: uuid.New(), APIKey: key, Admin: true}, true, nil
	})
	e.GET("/api/v1/users", handler.List, auth.RequiredAdmin)
	e.GET("/api/v1/users/api-key-info", handler.APIKeyInfo, auth.Required)
	e.POST("/api/v1/users/regenerate-api-key", handler.RegenerateAPIKey, auth.Required)
	return e
}
