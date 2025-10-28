package repositories

import (
	"context"
	"tormentus/internal/models"
)

type RefreshTokenRepository interface {
	Create(ctx context.Context, token *models.RefreshToken) error
	GetByToken(ctx context.Context, token string) (*models.RefreshToken, error)
	DeleteByUserID(ctx context.Context, userID string) error
	DeleteByToken(ctx context.Context, token string) error
}
