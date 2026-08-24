package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v5"
)

func TestServeOpenAPISpec(t *testing.T) {
	server := echo.New()
	server.GET("/openapi.json", ServeOpenAPISpec)

	request := httptest.NewRequest(http.MethodGet, "/openapi.json", nil)
	recorder := httptest.NewRecorder()
	server.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}
	if got := recorder.Header().Get(echo.HeaderContentType); got != echo.MIMEApplicationJSON {
		t.Fatalf("expected content type %q, got %q", echo.MIMEApplicationJSON, got)
	}
	if string(openAPISpec) != recorder.Body.String() {
		t.Fatal("response body does not match embedded OpenAPI document")
	}

	var document struct {
		OpenAPI string `json:"openapi"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &document); err != nil {
		t.Fatalf("response is not valid JSON: %v", err)
	}
	if document.OpenAPI != "3.2.0" {
		t.Fatalf("expected OpenAPI 3.2.0, got %q", document.OpenAPI)
	}
}
