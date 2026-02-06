package repositories

import (
	"context"
	"database/sql"
	"tormentus/internal/models"
)

type PostgresWatchlistRepository struct {
	db *sql.DB
}

func NewPostgresWatchlistRepository(db *sql.DB) *PostgresWatchlistRepository {
	return &PostgresWatchlistRepository{db: db}
}

func (r *PostgresWatchlistRepository) GetUserWatchlist(ctx context.Context, userID int64) (*models.Watchlist, error) {
	var watchlist models.Watchlist
	err := r.db.QueryRowContext(ctx, `
		SELECT id, user_id, name, is_default, created_at 
		FROM watchlists 
		WHERE user_id = $1 AND is_default = true
	`, userID).Scan(&watchlist.ID, &watchlist.UserID, &watchlist.Name, &watchlist.IsDefault, &watchlist.CreatedAt)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	// Get items
	symbols, err := r.GetSymbols(ctx, watchlist.ID)
	if err != nil {
		return nil, err
	}
	watchlist.Items = symbols

	return &watchlist, nil
}

func (r *PostgresWatchlistRepository) GetOrCreateDefault(ctx context.Context, userID int64) (*models.Watchlist, error) {
	watchlist, err := r.GetUserWatchlist(ctx, userID)
	if err != nil {
		return nil, err
	}

	if watchlist != nil {
		return watchlist, nil
	}

	// Create default watchlist
	var id int64
	err = r.db.QueryRowContext(ctx, `
		INSERT INTO watchlists (user_id, name, is_default)
		VALUES ($1, 'Favoritos', true)
		RETURNING id
	`, userID).Scan(&id)
	if err != nil {
		return nil, err
	}

	return &models.Watchlist{
		ID:        id,
		UserID:    userID,
		Name:      "Favoritos",
		IsDefault: true,
		Items:     []string{},
	}, nil
}

func (r *PostgresWatchlistRepository) AddSymbol(ctx context.Context, watchlistID int64, symbol string) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO watchlist_items (watchlist_id, symbol, position)
		VALUES ($1, $2, (SELECT COALESCE(MAX(position), 0) + 1 FROM watchlist_items WHERE watchlist_id = $1))
		ON CONFLICT (watchlist_id, symbol) DO NOTHING
	`, watchlistID, symbol)
	return err
}

func (r *PostgresWatchlistRepository) RemoveSymbol(ctx context.Context, watchlistID int64, symbol string) error {
	_, err := r.db.ExecContext(ctx, `
		DELETE FROM watchlist_items WHERE watchlist_id = $1 AND symbol = $2
	`, watchlistID, symbol)
	return err
}

func (r *PostgresWatchlistRepository) GetSymbols(ctx context.Context, watchlistID int64) ([]string, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT symbol FROM watchlist_items 
		WHERE watchlist_id = $1 
		ORDER BY position ASC
	`, watchlistID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var symbols []string
	for rows.Next() {
		var symbol string
		if err := rows.Scan(&symbol); err != nil {
			return nil, err
		}
		symbols = append(symbols, symbol)
	}

	if symbols == nil {
		symbols = []string{}
	}

	return symbols, nil
}
