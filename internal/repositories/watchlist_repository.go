package repositories

import (
	"context"
	"tormentus/internal/models"
)

type WatchlistRepository interface {
	GetUserWatchlist(ctx context.Context, userID int64) (*models.Watchlist, error)
	GetOrCreateDefault(ctx context.Context, userID int64) (*models.Watchlist, error)
	AddSymbol(ctx context.Context, watchlistID int64, symbol string) error
	RemoveSymbol(ctx context.Context, watchlistID int64, symbol string) error
	GetSymbols(ctx context.Context, watchlistID int64) ([]string, error)
}
