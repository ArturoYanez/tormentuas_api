package repositories

import (
	"context"
	"tormentus/internal/models"
)

type UserRepository interface {
	// User CRUD
	CreateUser(ctx context.Context, user *models.User) error
	GetUserByEmail(ctx context.Context, email string) (*models.User, error)
	GetUserByID(ctx context.Context, id int64) (*models.User, error)
	UpdateUser(ctx context.Context, user *models.User) error
	UpdatePassword(ctx context.Context, userID int64, hashedPassword string) error

	// Balance
	UpdateBalance(ctx context.Context, userID int64, amount float64, isDemo bool) error
	GetBalance(ctx context.Context, userID int64, isDemo bool) (float64, error)
	UpdateTradeStats(ctx context.Context, userID int64, won bool) error

	// Stats & Settings
	GetUserStats(ctx context.Context, userID int64) (*models.UserStats, error)
	GetUserSettings(ctx context.Context, userID int64) (*models.UserSettings, error)
	SaveUserSettings(ctx context.Context, settings *models.UserSettings) error
}
