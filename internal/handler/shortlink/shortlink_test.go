package shortlink

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"

	commonhandler "go-tetra/internal/handler"
	shortlinkservice "go-tetra/internal/service/shortlink"
)

type serviceStub struct {
	createInput  shortlinkservice.CreateInput
	created      shortlinkservice.Created
	createErr    error
	expiryTTL    time.Duration
	expiresAt    time.Time
	resolved     string
	resolveInput string
	resolveCalls int
	resolveErr   error
	qrShortcode  string
	qrCode       []byte
	qrErr        error
}

func (s *serviceStub) Create(_ context.Context, input shortlinkservice.CreateInput) (shortlinkservice.Created, error) {
	s.createInput = input
	return s.created, s.createErr
}

func (*serviceStub) Get(context.Context, string) (shortlinkservice.Public, error) {
	return shortlinkservice.Public{}, shortlinkservice.ErrNotFound
}

func (*serviceStub) ListForUser(context.Context, uuid.UUID) ([]shortlinkservice.Owned, error) {
	return []shortlinkservice.Owned{}, nil
}

func (*serviceStub) ListAll(context.Context) ([]shortlinkservice.Admin, error) {
	return []shortlinkservice.Admin{}, nil
}

func (*serviceStub) Delete(context.Context, string, string) error { return nil }

func (*serviceStub) Available(context.Context, string) (bool, error) { return true, nil }

func (s *serviceStub) SetExpiry(_ context.Context, _, _ string, ttl time.Duration) (time.Time, error) {
	s.expiryTTL = ttl
	return s.expiresAt, nil
}

func TestCreateAcceptsHumanReadableDuration(t *testing.T) {
	t.Parallel()

	service := &serviceStub{}
	e := newTestEcho(service)
	request := httptest.NewRequest(
		http.MethodPut,
		"/api/v1/shortlinks",
		strings.NewReader(`{"destination":"https://example.com","duration":"1 week, 2 days and 3 hours"}`),
	)
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	e.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusCreated {
		t.Fatalf("status = %d, want 201; body=%s", recorder.Code, recorder.Body.String())
	}
	want := 9*24*time.Hour + 3*time.Hour
	if service.createInput.TTL != want {
		t.Fatalf("TTL = %s, want %s", service.createInput.TTL, want)
	}
}

func TestCreateRejectsUnrecognizedDuration(t *testing.T) {
	t.Parallel()

	e := newTestEcho(&serviceStub{})
	request := httptest.NewRequest(
		http.MethodPut,
		"/api/v1/shortlinks",
		strings.NewReader(`{"destination":"https://example.com","duration":"eventually"}`),
	)
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	e.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400; body=%s", recorder.Code, recorder.Body.String())
	}
}

func TestSetExpiryAcceptsHumanReadableDuration(t *testing.T) {
	t.Parallel()

	service := &serviceStub{expiresAt: time.Date(2026, time.August, 30, 12, 0, 0, 0, time.UTC)}
	e := newTestEcho(service)
	request := httptest.NewRequest(
		http.MethodPatch,
		"/api/v1/shortlinks/docs/secret/set-expiry",
		strings.NewReader(`{"duration":"2 days and 30 minutes"}`),
	)
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	e.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200; body=%s", recorder.Code, recorder.Body.String())
	}
	want := 48*time.Hour + 30*time.Minute
	if service.expiryTTL != want {
		t.Fatalf("TTL = %s, want %s", service.expiryTTL, want)
	}
}

func (*serviceStub) Toggle(context.Context, string) (bool, error) { return true, nil }

func (s *serviceStub) Resolve(_ context.Context, shortcode string) (string, error) {
	s.resolveInput = shortcode
	s.resolveCalls++
	return s.resolved, s.resolveErr
}

func (s *serviceStub) CreateQRCode(_ context.Context, shortcode string) ([]byte, error) {
	s.qrShortcode = shortcode
	return s.qrCode, s.qrErr
}

func TestCreate(t *testing.T) {
	t.Parallel()

	service := &serviceStub{created: shortlinkservice.Created{
		Shortcode:   "docs",
		Shortlink:   "https://go.example/docs",
		Destination: "https://example.com/docs",
		Secret:      strings.Repeat("a", 64),
	}}
	e := newTestEcho(service)
	request := httptest.NewRequest(
		http.MethodPut,
		"/api/v1/shortlinks",
		strings.NewReader(`{"destination":"https://example.com/docs","shortcode":"docs","duration":"15m"}`),
	)
	request.Header.Set("Content-Type", "application/json")
	request.RemoteAddr = "192.0.2.10:1234"
	recorder := httptest.NewRecorder()
	e.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusCreated {
		t.Fatalf("status = %d, want 201; body=%s", recorder.Code, recorder.Body.String())
	}
	if service.createInput.Shortcode != "docs" || service.createInput.TTL != 15*time.Minute {
		t.Fatalf("create input = %#v", service.createInput)
	}
	if service.createInput.CreatorIP != "192.0.2.10" {
		t.Fatalf("CreatorIP = %q, want 192.0.2.10", service.createInput.CreatorIP)
	}
	if !strings.Contains(recorder.Body.String(), `"expiresAt":null`) {
		t.Fatalf("response must contain an explicit null expiresAt; body=%s", recorder.Body.String())
	}
}

func TestCreateRejectsUnknownJSONFields(t *testing.T) {
	t.Parallel()

	e := newTestEcho(&serviceStub{})
	request := httptest.NewRequest(
		http.MethodPut,
		"/api/v1/shortlinks",
		strings.NewReader(`{"destination":"https://example.com","unexpected":true}`),
	)
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	e.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400; body=%s", recorder.Code, recorder.Body.String())
	}
}

func TestRedirect(t *testing.T) {
	t.Parallel()

	e := newTestEcho(&serviceStub{resolved: "https://example.com/destination"})
	recorder := httptest.NewRecorder()
	e.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/go/abc", nil))

	if recorder.Code != http.StatusFound {
		t.Fatalf("status = %d, want 302; body=%s", recorder.Code, recorder.Body.String())
	}
	if location := recorder.Header().Get("Location"); location != "https://example.com/destination" {
		t.Fatalf("Location = %q", location)
	}
}

func TestRedirectWithTrailingPlusOpensInfoPage(t *testing.T) {
	t.Parallel()

	service := &serviceStub{}
	e := newTestEcho(service)
	recorder := httptest.NewRecorder()
	e.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/go/abc+", nil))

	if recorder.Code != http.StatusFound {
		t.Fatalf("status = %d, want 302; body=%s", recorder.Code, recorder.Body.String())
	}
	if location := recorder.Header().Get("Location"); location != "/shortlink/abc" {
		t.Fatalf("Location = %q, want %q", location, "/shortlink/abc")
	}
	if service.resolveCalls != 0 {
		t.Fatalf("Resolve called %d times, want 0", service.resolveCalls)
	}
}

func TestNotFoundError(t *testing.T) {
	t.Parallel()

	e := newTestEcho(&serviceStub{resolveErr: shortlinkservice.ErrNotFound})
	recorder := httptest.NewRecorder()
	e.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/go/missing", nil))

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want 404; body=%s", recorder.Code, recorder.Body.String())
	}
}

func TestCreateQRCode(t *testing.T) {
	t.Parallel()

	service := &serviceStub{qrCode: []byte(`<svg xmlns="http://www.w3.org/2000/svg"></svg>`)}
	e := newTestEcho(service)
	recorder := httptest.NewRecorder()
	e.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/v1/shortlinks/docs/qr.svg", nil))

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200; body=%s", recorder.Code, recorder.Body.String())
	}
	if contentType := recorder.Header().Get(echo.HeaderContentType); contentType != "image/svg+xml" {
		t.Fatalf("Content-Type = %q, want %q", contentType, "image/svg+xml")
	}
	if service.qrShortcode != "docs" {
		t.Fatalf("shortcode = %q, want %q", service.qrShortcode, "docs")
	}
	if body := recorder.Body.String(); body != string(service.qrCode) {
		t.Fatalf("body = %q, want %q", body, service.qrCode)
	}
}

func TestCreateQRCodeNotFound(t *testing.T) {
	t.Parallel()

	e := newTestEcho(&serviceStub{qrErr: shortlinkservice.ErrNotFound})
	recorder := httptest.NewRecorder()
	e.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/v1/shortlinks/missing/qr.svg", nil))

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want 404; body=%s", recorder.Code, recorder.Body.String())
	}
}

func newTestEcho(service Service) *echo.Echo {
	e := echo.New()
	e.HTTPErrorHandler = commonhandler.ErrorHandler(nil)
	e.Pre(middleware.RequestID())
	handler := New(service)
	e.PUT("/api/v1/shortlinks", handler.Create)
	e.PATCH("/api/v1/shortlinks/:shortcode/:secret/set-expiry", handler.SetExpiry)
	e.GET("/api/v1/shortlinks/:shortcode/qr.svg", handler.GetQRCode)
	e.GET("/api/v1/shortlinks/:shortcode", handler.Get)
	e.GET("/go/:shortcode", handler.Redirect)
	return e
}
