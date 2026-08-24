package auth

import (
	"bytes"
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"

	commonhandler "go-tetra/internal/handler"
	authservice "go-tetra/internal/service/auth"
	userservice "go-tetra/internal/service/user"
)

type authenticatorStub struct {
	identity   authservice.Identity
	session    authservice.Session
	sessionSet authservice.Session
}

func (*authenticatorStub) Begin(http.ResponseWriter) (string, error) {
	return "https://issuer.example/authorize", nil
}

func (s *authenticatorStub) Complete(context.Context, *http.Request) (authservice.Identity, error) {
	return s.identity, nil
}

func (s *authenticatorStub) SetSession(_ http.ResponseWriter, session authservice.Session) error {
	s.sessionSet = session
	return nil
}

func (s *authenticatorStub) ReadSession(*http.Request) (authservice.Session, error) {
	return s.session, nil
}

func (*authenticatorStub) ClearState(http.ResponseWriter)   {}
func (*authenticatorStub) ClearSession(http.ResponseWriter) {}

type userServiceStub struct{ user userservice.AuthenticatedUser }

func (s userServiceStub) UpsertOIDC(context.Context, userservice.OIDCIdentity) (userservice.AuthenticatedUser, error) {
	return s.user, nil
}

func TestStart(t *testing.T) {
	t.Parallel()

	e := testEcho(New(&authenticatorStub{}, userServiceStub{}))
	recorder := httptest.NewRecorder()
	e.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/oidc/start", nil))

	if recorder.Code != http.StatusFound {
		t.Fatalf("status = %d, want 302", recorder.Code)
	}
	if recorder.Header().Get("Location") != "https://issuer.example/authorize" {
		t.Fatalf("Location = %q", recorder.Header().Get("Location"))
	}
}

func TestCallbackCreatesSession(t *testing.T) {
	t.Parallel()

	apiKey := uuid.New()
	authenticator := &authenticatorStub{identity: authservice.Identity{
		Subject: "auth0|123", Username: "tetra", Email: "user@example.com", Admin: true,
	}}
	handler := New(authenticator, userServiceStub{user: userservice.AuthenticatedUser{
		Subject: "auth0|123", Username: "tetra", Admin: true, APIKey: apiKey,
	}})
	e := testEcho(handler)
	recorder := httptest.NewRecorder()
	e.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/oidc/callback", nil))

	if recorder.Code != http.StatusFound {
		t.Fatalf("status = %d, want 302; body=%s", recorder.Code, recorder.Body.String())
	}
	if authenticator.sessionSet.APIKey != apiKey || authenticator.sessionSet.Subject != "auth0|123" {
		t.Fatalf("session = %#v", authenticator.sessionSet)
	}
}

func TestCallbackLogsRawOIDCClaimsAtDebugLevel(t *testing.T) {
	t.Parallel()

	rawClaims := json.RawMessage(`{"sub":"auth0|123","custom":"provider-value"}`)
	authenticator := &authenticatorStub{identity: authservice.Identity{
		Subject: "auth0|123", Username: "tetra", Email: "user@example.com", RawClaims: rawClaims,
	}}
	handler := New(authenticator, userServiceStub{user: userservice.AuthenticatedUser{Subject: "auth0|123"}})

	var output bytes.Buffer
	e := testEcho(handler)
	e.Logger = slog.New(slog.NewJSONHandler(&output, &slog.HandlerOptions{Level: slog.LevelDebug}))
	e.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/oidc/callback", nil))

	logged := output.String()
	if !strings.Contains(logged, "authenticated OIDC user info") || !strings.Contains(logged, "provider-value") {
		t.Fatalf("debug log does not contain raw claims: %s", logged)
	}
}

func testEcho(handler *Handler) *echo.Echo {
	e := echo.New()
	e.HTTPErrorHandler = commonhandler.ErrorHandler(nil)
	e.GET("/oidc/start", handler.Start)
	e.GET("/oidc/callback", handler.Callback)
	return e
}
