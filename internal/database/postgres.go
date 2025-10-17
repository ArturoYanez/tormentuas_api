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