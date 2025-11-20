package repositories

import (
	"context"
	"fmt"

	"tormentus/internal/models"

	"github.com/jackc/pgx/v5"
)

type PostgresRefreshTokenRepository struct {
	db *pgx.Conn
}

func NewPostgresRefreshTokenRepository(db *pgx.Conn) *PostgresRefreshTokenRepository {
	return &PostgresRefreshTokenRepository{db: db}
}

func (r *PostgresRefreshTokenRepository) Create(ctx context.Context, token *models.RefreshToken) error {
	query := `
		INSERT INTO refresh_tokens (user_id, token, expires_at)
		VALUES ($1, $2, $3)
		RETURNING id, created_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		token.UserID,
		token.Token,
		token.ExpiresAt,
	).Scan(&token.ID, &token.CreatedAt)

	if err != nil {
		return fmt.Errorf("error creating refresh token: %w", err)
	}

	return nil
}

func (r *PostgresRefreshTokenRepository) GetByToken(ctx context.Context, token string) (*models.RefreshToken, error) {
	query := `
		SELECT id, user_id, token, expires_at, created_at
		FROM refresh_tokens
		WHERE token = $1
	`

	var rt models.RefreshToken
	err := r.db.QueryRow(ctx, query, token).Scan(
		&rt.ID,
		&rt.UserID,
		&rt.Token,
		&rt.ExpiresAt,
		&rt.CreatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("error getting refresh token by token: %w", err)
	}

	return &rt, nil
}

func (r *PostgresRefreshTokenRepository) DeleteByUserID(ctx context.Context, userID string) error {
	query := `DELETE FROM refresh_tokens WHERE user_id = $1`

	_, err := r.db.Exec(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("error deleting refresh tokens by user ID: %w", err)
	}

	return nil
}

func (r *PostgresRefreshTokenRepository) DeleteByToken(ctx context.Context, token string) error {
	query := `DELETE FROM refresh_tokens WHERE token = $1`

	_, err := r.db.Exec(ctx, query, token)
	if err != nil {
		return fmt.Errorf("error deleting refresh token by token: %w", err)
	}

	return nil
}
