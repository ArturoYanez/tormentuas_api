package repositories

import (
	"context"
	"tormentus/internal/models"
)

// TradeRepository define la interfaz para operaciones de trades
type TradeRepository interface {
	CreateTrade(ctx context.Context, trade *models.Trade) error
	GetTradeByID(ctx context.Context, id int64) (*models.Trade, error)
	GetUserTrades(ctx context.Context, userID int64, limit, offset int) ([]*models.Trade, error)
	GetActiveTrades(ctx context.Context, userID int64) ([]*models.Trade, error)
	UpdateTrade(ctx context.Context, trade *models.Trade) error
	GetUserTradeStats(ctx context.Context, userID int64) (*models.TradeStats, error)
	GetRecentWinners(ctx context.Context, hours int) ([]int64, error)
}
