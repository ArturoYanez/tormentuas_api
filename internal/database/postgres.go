package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"tormentus/pkg/config"

	"github.com/jackc/pgx/v5/pgxpool"
)

type DB struct {
	Pool *pgxpool.Pool
}

func NewDB(cfg *config.Config) (*DB, error) {
	// Construir conecction string
	connString := fmt.Sprintf(
		"postgresql://%s:%s@%s:%d/%s",
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBName,
	)

	// Configuracion de pool de conexiones
	poolConfig, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, fmt.Errorf("error parsing connection string: %w", err)
	}

	// Conectar con timeout
	ctx, cancel := content.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("error creating connection pool: %w", err)
	}

	// Verificar conexion
	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.ErrorF("error pinging database: %w", err)
	}

	log.Println("Conectado a PostgreSQL exitosamente")
	return &DB{Pool: pool}, nil
}

func (db *DB) Close() {
	db.Pool.Close()
}
