package api

import (
	_ "embed"
	"net/http"

	"github.com/labstack/echo/v5"
)

// openAPISpec contains the public API specification in the compiled binary.
//
//go:embed openapi.json
var openAPISpec []byte

// ServeOpenAPISpec serves the embedded OpenAPI document.
func ServeOpenAPISpec(c *echo.Context) error {
	return c.Blob(http.StatusOK, echo.MIMEApplicationJSON, openAPISpec)
}
