package app

import (
	"log/slog"
	"testing"
	"time"
)

func TestLoadConfigDefaults(t *testing.T) {
	setRequiredEnvironment(t)

	cfg, err := LoadConfig()
	if err != nil {
		t.Fatalf("LoadConfig() error = %v", err)
	}

	if cfg.Address != ":3000" {
		t.Errorf("Address = %q, want :3000", cfg.Address)
	}
	if cfg.BaseURL != defaultBaseURL {
		t.Errorf("BaseURL = %q, want %q", cfg.BaseURL, defaultBaseURL)
	}
	if cfg.FrontendDir != defaultFrontendDir {
		t.Errorf("FrontendDir = %q, want %q", cfg.FrontendDir, defaultFrontendDir)
	}
	if cfg.ShutdownTimeout != defaultShutdownTimeout {
		t.Errorf("ShutdownTimeout = %v, want %v", cfg.ShutdownTimeout, defaultShutdownTimeout)
	}
	if cfg.CleanupInterval != defaultCleanupInterval {
		t.Errorf("CleanupInterval = %v, want %v", cfg.CleanupInterval, defaultCleanupInterval)
	}
	if cfg.LogLevel != slog.LevelInfo {
		t.Errorf("LogLevel = %v, want info", cfg.LogLevel)
	}
	if cfg.OIDC.IssuerURL != "https://identity.example.com" {
		t.Errorf("OIDC.IssuerURL = %q", cfg.OIDC.IssuerURL)
	}
	if cfg.OIDC.RedirectURL != defaultBaseURL+"/oidc/callback" {
		t.Errorf("OIDC.RedirectURL = %q", cfg.OIDC.RedirectURL)
	}
}

func TestLoadConfigOverrides(t *testing.T) {
	setRequiredEnvironment(t)
	t.Setenv("ADDRESS", "127.0.0.1:8080")
	t.Setenv("PORT", "invalid-but-ignored")
	t.Setenv("BASE_URL", "https://tetra.example.com/")
	t.Setenv("FRONTEND_DIR", "web/dist")
	t.Setenv("SHUTDOWN_TIMEOUT", "30s")
	t.Setenv("SHORTLINK_CLEANUP_INTERVAL", "10m")
	t.Setenv("LOG_LEVEL", "debug")
	t.Setenv("OIDC_DOMAIN", "http://identity.example.com")

	cfg, err := LoadConfig()
	if err != nil {
		t.Fatalf("LoadConfig() error = %v", err)
	}

	if cfg.Address != "127.0.0.1:8080" {
		t.Errorf("Address = %q", cfg.Address)
	}
	if cfg.BaseURL != "https://tetra.example.com" {
		t.Errorf("BaseURL = %q", cfg.BaseURL)
	}
	if cfg.ShutdownTimeout != 30*time.Second {
		t.Errorf("ShutdownTimeout = %v", cfg.ShutdownTimeout)
	}
	if cfg.CleanupInterval != 10*time.Minute {
		t.Errorf("CleanupInterval = %v", cfg.CleanupInterval)
	}
	if cfg.LogLevel != slog.LevelDebug {
		t.Errorf("LogLevel = %v, want debug", cfg.LogLevel)
	}
	if cfg.OIDC.IssuerURL != "http://identity.example.com" {
		t.Errorf("OIDC.IssuerURL = %q", cfg.OIDC.IssuerURL)
	}
	if cfg.OIDC.RedirectURL != "https://tetra.example.com/oidc/callback" {
		t.Errorf("OIDC.RedirectURL = %q", cfg.OIDC.RedirectURL)
	}
}

func TestLoadConfigRejectsInvalidValues(t *testing.T) {
	tests := []struct {
		name  string
		key   string
		value string
	}{
		{name: "port", key: "PORT", value: "70000"},
		{name: "base URL", key: "BASE_URL", value: "localhost:3000"},
		{name: "shutdown timeout", key: "SHUTDOWN_TIMEOUT", value: "0s"},
		{name: "cleanup interval", key: "SHORTLINK_CLEANUP_INTERVAL", value: "eventually"},
		{name: "log level", key: "LOG_LEVEL", value: "verbose"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			setRequiredEnvironment(t)
			t.Setenv(test.key, test.value)
			if _, err := LoadConfig(); err == nil {
				t.Fatal("LoadConfig() error = nil")
			}
		})
	}
}

func setRequiredEnvironment(t *testing.T) {
	t.Helper()
	for _, name := range []string{"ADDRESS", "PORT", "BASE_URL", "FRONTEND_DIR", "SHUTDOWN_TIMEOUT", "SHORTLINK_CLEANUP_INTERVAL", "LOG_LEVEL"} {
		t.Setenv(name, "")
	}
	t.Setenv("DATABASE_URL", "postgres://tetra@example.com/tetra")
	t.Setenv("OIDC_CLIENT_ID", "client-id")
	t.Setenv("OIDC_CLIENT_SECRET", "client-secret")
	t.Setenv("OIDC_DOMAIN", "identity.example.com")
}
