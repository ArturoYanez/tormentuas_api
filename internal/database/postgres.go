package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"tormentus/pkg/config"

	"github.com/jackc/pgx/v5/pgxpool"
)

type DB struct {
	Pool *pgxpool.Pool
	SQL  *sql.DB
}

func NewDB(cfg *config.Config) (*DB, error) {
	// Construir conection string
	var connString string
	if cfg.DBPassword == "" {
		connString = fmt.Sprintf(
			"postgresql://%s@%s:%d/%s?sslmode=disable",
			cfg.DBUser,
			cfg.DBHost,
			cfg.DBPort,
			cfg.DBName,
		)
	} else {
		connString = fmt.Sprintf(
			"postgresql://%s:%s@%s:%d/%s?sslmode=disable",
			cfg.DBUser,
			cfg.DBPassword,
			cfg.DBHost,
			cfg.DBPort,
			cfg.DBName,
		)
	}

	log.Printf("String de conexión: %s", connString) // Para debug

	// Configuracion de pool de conexiones
	poolConfig, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, fmt.Errorf("error parsing connection string: %w", err)
	}

	// Optimizaciones para produccion
	poolConfig.MaxConns = 25
	poolConfig.MinConns = 5
	poolConfig.HealthCheckPeriod = 1 * time.Minute

	// Conectar con timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("error creating connection pool: %w", err)
	}

	// Verificar conexion
	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("error pinging database: %w", err)
	}

	// Aquí abrimos una conexión compatible con database/sql
	sqlDB, err := sql.Open("pgx", connString)
	if err != nil {
		return nil, fmt.Errorf("error creando cliente sql: %w", err)
	}

	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("error conectando con sql.DB: %w", err)
	}

	log.Println("Conectado a PostgreSQL exitosamente")
	return &DB{Pool: pool, SQL: sqlDB}, nil
}

func (db *DB) Close() {
	if db.SQL != nil {
		db.SQL.Close()
	}
	if db.Pool != nil {
		db.Pool.Close()
	}
}
