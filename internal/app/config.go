package app

import (
	"fmt"
	"log/slog"
	"net"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"go-tetra/internal/service/auth"
)

const (
	defaultPort            = 3000
	defaultBaseURL         = "http://localhost:3000"
	defaultFrontendDir     = "dist/frontend"
	defaultShutdownTimeout = 10 * time.Second
	defaultCleanupInterval = 1 * time.Minute
)

// Config contains all process configuration needed to start the server. Keeping environment access here makes startup
// predictable and easy to test.
type Config struct {
	DatabaseURL     string
	Address         string
	BaseURL         string
	FrontendDir     string
	ShutdownTimeout time.Duration
	CleanupInterval time.Duration
	LogLevel        slog.Level
	OIDC            auth.Config
}

func LoadConfig() (Config, error) {
	databaseURL, err := requiredEnv("DATABASE_URL")
	if err != nil {
		return Config{}, err
	}

	address, err := serverAddress(os.Getenv("ADDRESS"), os.Getenv("PORT"))
	if err != nil {
		return Config{}, err
	}

	baseURL := valueOrDefault(os.Getenv("BASE_URL"), defaultBaseURL)
	parsedBaseURL, err := url.ParseRequestURI(baseURL)
	if err != nil || parsedBaseURL.Host == "" || (parsedBaseURL.Scheme != "http" && parsedBaseURL.Scheme != "https") {
		return Config{}, fmt.Errorf("BASE_URL must be an absolute HTTP or HTTPS URL")
	}

	shutdownTimeout := defaultShutdownTimeout
	if value := os.Getenv("SHUTDOWN_TIMEOUT"); value != "" {
		shutdownTimeout, err = time.ParseDuration(value)
		if err != nil || shutdownTimeout <= 0 {
			return Config{}, fmt.Errorf("SHUTDOWN_TIMEOUT must be a positive Go duration")
		}
	}

	cleanupInterval := defaultCleanupInterval
	if value := os.Getenv("SHORTLINK_CLEANUP_INTERVAL"); value != "" {
		cleanupInterval, err = time.ParseDuration(value)
		if err != nil || cleanupInterval <= 0 {
			return Config{}, fmt.Errorf("SHORTLINK_CLEANUP_INTERVAL must be a positive Go duration")
		}
	}

	var logLevel slog.Level
	if value := os.Getenv("LOG_LEVEL"); value != "" {
		if err := logLevel.UnmarshalText([]byte(value)); err != nil {
			return Config{}, fmt.Errorf("LOG_LEVEL must be debug, info, warn, or error")
		}
	}

	clientID, err := requiredEnv("OIDC_CLIENT_ID")
	if err != nil {
		return Config{}, err
	}
	clientSecret, err := requiredEnv("OIDC_CLIENT_SECRET")
	if err != nil {
		return Config{}, err
	}
	issuerURL, err := requiredEnv("OIDC_DOMAIN")
	if err != nil {
		return Config{}, err
	}
	if !strings.HasPrefix(issuerURL, "https://") && !strings.HasPrefix(issuerURL, "http://") {
		issuerURL = "https://" + issuerURL
	}

	return Config{
		DatabaseURL:     databaseURL,
		Address:         address,
		BaseURL:         strings.TrimRight(baseURL, "/"),
		FrontendDir:     valueOrDefault(os.Getenv("FRONTEND_DIR"), defaultFrontendDir),
		ShutdownTimeout: shutdownTimeout,
		CleanupInterval: cleanupInterval,
		LogLevel:        logLevel,
		OIDC: auth.Config{
			IssuerURL:    issuerURL,
			ClientID:     clientID,
			ClientSecret: clientSecret,
			RedirectURL:  strings.TrimRight(baseURL, "/") + "/oidc/callback",
		},
	}, nil
}

func requiredEnv(name string) (string, error) {
	value := os.Getenv(name)
	if value == "" {
		return "", fmt.Errorf("%s is required", name)
	}

	return value, nil
}

func serverAddress(address, portValue string) (string, error) {
	if address != "" {
		return address, nil
	}
	port := defaultPort
	if portValue != "" {
		parsed, err := strconv.Atoi(portValue)
		if err != nil || parsed < 1 || parsed > 65535 {
			return "", fmt.Errorf("PORT must be an integer between 1 and 65535")
		}

		port = parsed
	}

	return net.JoinHostPort("", strconv.Itoa(port)), nil
}

func valueOrDefault(value, fallback string) string {
	if value == "" {
		return fallback
	}

	return value
}
