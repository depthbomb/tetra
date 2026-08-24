package app

import (
	"context"
	"fmt"
	"log"

	"go-tetra/internal/db"
)

func Migrate(ctx context.Context) error {
	databaseURL, err := requiredEnv("DATABASE_URL")
	if err != nil {
		return err
	}

	store, err := db.Open(ctx, databaseURL)
	if err != nil {
		return fmt.Errorf("open database: %w", err)
	}
	defer store.Close()

	if err := store.Client.Schema.Create(ctx); err != nil {
		return fmt.Errorf("migrate database: %w", err)
	}

	log.Println("successfully ran database migrations")

	return nil
}
