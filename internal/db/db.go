package db

import (
	"context"
	"database/sql"
	"fmt"

	"entgo.io/ent/dialect"
	entsql "entgo.io/ent/dialect/sql"
	_ "github.com/jackc/pgx/v5/stdlib"

	"go-tetra/ent"
)

// Store owns both the Ent client used by repositories and the underlying SQL connection pool used for operational
// checks. Keeping ownership explicit avoids hidden package-level state and makes application startup deterministic.
type Store struct {
	Client *ent.Client
	sqlDB  *sql.DB
}

// Open connects to PostgreSQL and verifies the connection before returning. The caller owns the returned Store and must
// close it.
func Open(ctx context.Context, dataSourceName string) (*Store, error) {
	database, err := sql.Open("pgx", dataSourceName)
	if err != nil {
		return nil, fmt.Errorf("open postgres: %w", err)
	}

	if err := database.PingContext(ctx); err != nil {
		_ = database.Close()
		return nil, fmt.Errorf("ping postgres: %w", err)
	}

	driver := entsql.OpenDB(dialect.Postgres, database)
	return &Store{
		Client: ent.NewClient(ent.Driver(driver)),
		sqlDB:  database,
	}, nil
}

// Ping verifies that PostgreSQL is reachable. It is intentionally independent of application tables so readiness still
// works before migrations run.
func (s *Store) Ping(ctx context.Context) error {
	if err := s.sqlDB.PingContext(ctx); err != nil {
		return fmt.Errorf("ping postgres: %w", err)
	}
	return nil
}

func (s *Store) Close() error {
	if err := s.Client.Close(); err != nil {
		return fmt.Errorf("close database: %w", err)
	}
	return nil
}
