package app

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"time"

	"github.com/labstack/echo/v5"

	"go-tetra/internal/db"
	"go-tetra/internal/service/auth"
	qrservice "go-tetra/internal/service/qr"
	shortlinkservice "go-tetra/internal/service/shortlink"
	userservice "go-tetra/internal/service/user"
)

// application owns the process-wide dependencies and their lifecycle. These values are shared, but remain explicit
// instead of becoming package globals.
type application struct {
	config     Config
	logger     *slog.Logger
	store      *db.Store
	auth       *auth.Manager
	users      *userservice.Service
	shortlinks *shortlinkservice.Service
}

func newApplication(ctx context.Context, config Config) (*application, error) {
	logger := slog.New(slog.NewJSONHandler(os.Stderr, &slog.HandlerOptions{Level: config.LogLevel}))
	store, err := db.Open(ctx, config.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}

	authManager, err := auth.New(ctx, config.OIDC)
	if err != nil {
		if closeErr := store.Close(); closeErr != nil {
			logger.Error("close database after failed startup", "error", closeErr)
		}

		return nil, fmt.Errorf("initialize OIDC: %w", err)
	}

	return &application{
		config:     config,
		logger:     logger,
		store:      store,
		auth:       authManager,
		users:      userservice.New(store.Client),
		shortlinks: shortlinkservice.New(store.Client, config.BaseURL, qrservice.New()),
	}, nil
}

func (a *application) close() {
	if err := a.store.Close(); err != nil {
		a.logger.Error("close database", "error", err)
	}
}

// Start builds and runs the application from environment configuration.
func Start(ctx context.Context) error {
	cfg, err := LoadConfig()
	if err != nil {
		return err
	}

	app, err := newApplication(ctx, cfg)
	if err != nil {
		return err
	}
	defer app.close()

	server, err := app.newServer()
	if err != nil {
		return err
	}
	stopCleanup := app.startShortlinkCleanup(ctx)
	defer stopCleanup()

	return (echo.StartConfig{
		Address:         cfg.Address,
		GracefulTimeout: cfg.ShutdownTimeout,
		HideBanner:      true,
	}).Start(ctx, server)
}

func (a *application) startShortlinkCleanup(parent context.Context) func() {
	ctx, cancel := context.WithCancel(parent)
	done := make(chan struct{})

	go func() {
		defer close(done)

		cleanup := func() {
			deleted, err := a.shortlinks.DeleteExpired(ctx)
			if err != nil {
				if ctx.Err() == nil {
					a.logger.Error("clean up expired shortlinks", "error", err)
				}
				return
			}
			if deleted > 0 {
				a.logger.Info("cleaned up expired shortlinks", "deleted", deleted)
			}
		}

		// Clean up once at startup instead of waiting for the first tick.
		cleanup()
		ticker := time.NewTicker(a.config.CleanupInterval)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				cleanup()
			}
		}
	}()

	return func() {
		cancel()
		<-done
	}
}
