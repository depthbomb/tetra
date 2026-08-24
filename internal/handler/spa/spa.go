package spa

import (
	"fmt"
	"io/fs"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/labstack/echo/v5"
)

type Handler struct {
	files fs.FS
}

func New(root string) (*Handler, error) {
	return newHandler(os.DirFS(root))
}

func newHandler(files fs.FS) (*Handler, error) {
	info, err := fs.Stat(files, "index.html")
	if err != nil {
		return nil, fmt.Errorf("frontend index not found: %w", err)
	}
	if info.IsDir() {
		return nil, fmt.Errorf("frontend index is a directory")
	}

	return &Handler{files: files}, nil
}

func (h *Handler) index(c *echo.Context) error {
	return c.FileFS("index.html", h.files)
}

// Serve serves real static files first, rejects missing asset-like paths, and otherwise returns the SPA shell for
// history-mode client routes.
func (h *Handler) Serve(c *echo.Context) error {
	name := cleanPath(c.Request().URL.Path)
	if name != "" {
		if info, err := fs.Stat(h.files, name); err == nil && !info.IsDir() {
			return c.FileFS(name, h.files)
		}
		if name == "assets" || strings.HasPrefix(name, "assets/") || path.Ext(name) != "" {
			return echo.NewHTTPError(http.StatusNotFound, "asset not found")
		}
	}

	return h.index(c)
}

func cleanPath(requestPath string) string {
	name := strings.TrimPrefix(path.Clean("/"+requestPath), "/")
	if name == "." || !fs.ValidPath(name) {
		return ""
	}

	return name
}
