package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/urfave/cli/v3"

	"go-tetra/internal/app"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	cliApp := &cli.Command{
		Name:  "tetra",
		Usage: "management commands",
		Commands: []*cli.Command{
			{
				Name:  "start",
				Usage: "start the server",
				Action: func(ctx context.Context, command *cli.Command) error {
					return app.Start(ctx)
				},
			},
			{
				Name:  "migrate",
				Usage: "runs append-only database migrations",
				Action: func(ctx context.Context, command *cli.Command) error {
					return app.Migrate(ctx)
				},
			},
		},
	}

	if err := cliApp.Run(ctx, os.Args); err != nil {
		log.Fatal(err)
	}
}
