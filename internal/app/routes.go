package app

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"

	"go-tetra/api"
	"go-tetra/ent"
	entuser "go-tetra/ent/user"
	commonhandler "go-tetra/internal/handler"
	authhandler "go-tetra/internal/handler/auth"
	healthhandler "go-tetra/internal/handler/health"
	shortlinkhandler "go-tetra/internal/handler/shortlink"
	spahandler "go-tetra/internal/handler/spa"
	userhandler "go-tetra/internal/handler/user"
	"go-tetra/internal/middleware/apikey"
)

func (a *application) newServer() (*echo.Echo, error) {
	spa, err := spahandler.New(a.config.FrontendDir)
	if err != nil {
		return nil, fmt.Errorf("initialize frontend: %w", err)
	}

	server := echo.New()
	server.Logger = a.logger
	server.HTTPErrorHandler = commonhandler.ErrorHandler(a.logger)
	server.Pre(middleware.RequestID())
	server.Pre(middleware.RemoveTrailingSlash())
	server.Use(middleware.Recover())
	server.Use(middleware.BodyLimit(2_097_152))
	server.Use(middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{
		LogStatus:   true,
		LogURI:      true,
		HandleError: true, // forwards the error to the global error handler so it can pick the status code
		LogValuesFunc: func(c *echo.Context, v middleware.RequestLoggerValues) error {
			if v.Error == nil {
				a.logger.LogAttrs(context.Background(), slog.LevelInfo, "REQUEST",
					slog.String("uri", v.URI),
					slog.Int("status", v.Status),
				)
			} else {
				a.logger.LogAttrs(context.Background(), slog.LevelError, "REQUEST_ERROR",
					slog.String("uri", v.URI),
					slog.Int("status", v.Status),
					slog.String("err", v.Error.Error()),
				)
			}

			return nil
		},
	}))

	server.GET("/openapi.json", api.ServeOpenAPISpec)

	//#region Health routes
	health := healthhandler.New(a.store)
	server.Any("/health", health.Health)
	server.Any("/healthz", health.Health)
	server.Any("/ready", health.Ready)
	//#endregion

	//#region Authentication routes
	authRoutes := authhandler.New(a.auth, a.users)
	oidc := server.Group("/oidc")
	oidc.GET("/start", authRoutes.Start)
	oidc.GET("/callback", authRoutes.Callback)
	oidc.GET("/session", authRoutes.Session)
	oidc.POST("/invalidate", authRoutes.Logout)
	//#endregion

	//#region API v1 routes
	apiRoutesV1 := server.Group("/api/v1")
	keyAuth := apikey.New(func(ctx context.Context, key uuid.UUID) (apikey.Principal, bool, error) {
		user, err := a.store.Client.User.Query().Where(entuser.APIKeyEQ(key)).Only(ctx)
		if ent.IsNotFound(err) {
			return apikey.Principal{}, false, nil
		}
		if err != nil {
			return apikey.Principal{}, false, err
		}

		return apikey.Principal{UserID: user.ID, APIKey: user.APIKey, Admin: user.Admin}, true, nil
	})

	users := userhandler.New(a.users, a.auth)
	usersRoutesV1 := apiRoutesV1.Group("/users")
	usersRoutesV1.GET("", users.List, keyAuth.RequiredAdmin)
	usersRoutesV1.GET("/api-key-info", users.APIKeyInfo, keyAuth.Required)
	usersRoutesV1.POST("/regenerate-api-key", users.RegenerateAPIKey, keyAuth.Required)

	shortlinks := shortlinkhandler.New(a.shortlinks)
	shortlinkRoutesV1 := apiRoutesV1.Group("/shortlinks")
	shortlinkRoutesV1.GET("", shortlinks.List, keyAuth.Required)
	shortlinkRoutesV1.GET("/all", shortlinks.ListAll, keyAuth.RequiredAdmin)
	shortlinkRoutesV1.PUT("", shortlinks.Create, keyAuth.Optional)
	shortlinkRoutesV1.GET("/:shortcode/available", shortlinks.Available)
	shortlinkRoutesV1.PATCH("/:shortcode/:secret/set-expiry", shortlinks.SetExpiry)
	shortlinkRoutesV1.PATCH("/:shortcode/toggle", shortlinks.Toggle, keyAuth.RequiredAdmin)
	shortlinkRoutesV1.DELETE("/:shortcode/:secret", shortlinks.Delete)
	shortlinkRoutesV1.POST("/:shortcode/:secret/delete", shortlinks.Delete)
	shortlinkRoutesV1.GET("/:shortcode/qr.svg", shortlinks.GetQRCode)
	shortlinkRoutesV1.GET("/:shortcode", shortlinks.Get)
	//#endregion

	//#region Shortlink redirection
	server.GET("/go/:shortcode", shortlinks.Redirect)
	//#endregion

	//notFound := func(*echo.Context) error { return echo.ErrNotFound }
	//server.Any("/api", notFound)
	//server.Any("/api/*", notFound)
	//server.Any("/oidc", notFound)
	//server.Any("/oidc/*", notFound)

	server.GET("/*", spa.Serve, middleware.Secure())

	return server, nil
}
