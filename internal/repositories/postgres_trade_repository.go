package repositories

import (
	"context"
	"fmt"
	"log"
	"time"

	"tormentus/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresTradeRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresTradeRepository(pool *pgxpool.Pool) *PostgresTradeRepository {
	return &PostgresTradeRepository{pool: pool}
}

func (r *PostgresTradeRepository) CreateTrade(ctx context.Context, trade *models.Trade) error {
	query := `
		INSERT INTO trades (user_id, symbol, direction, amount, entry_price, payout_percentage, 
		                    status, duration, is_demo, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id
	`

	err := r.pool.QueryRow(ctx, query,
		trade.UserID,
		trade.Symbol,
		string(trade.Direction),
		trade.Amount,
		trade.EntryPrice,
		trade.Payout,
		string(trade.Status),
		trade.Duration,
		trade.IsDemo,
		trade.ExpiresAt,
		trade.CreatedAt,
	).Scan(&trade.ID)

	if err != nil {
		log.Printf("Error creating trade: %v", err)
		return fmt.Errorf("error creating trade: %w", err)
	}

	log.Printf("Trade created: ID=%d, User=%d, Symbol=%s", trade.ID, trade.UserID, trade.Symbol)
	return nil
}

func (r *PostgresTradeRepository) GetTradeByID(ctx context.Context, id int64) (*models.Trade, error) {
	query := `
		SELECT id, user_id, symbol, direction, amount, entry_price, exit_price,
		       payout_percentage, profit, status, duration, is_demo, 
		       created_at, expires_at, closed_at
		FROM trades WHERE id = $1
	`

	var trade models.Trade
	var direction, status string
	var exitPrice, profit *float64
	var closedAt *time.Time

	err := r.pool.QueryRow(ctx, query, id).Scan(
		&trade.ID, &trade.UserID, &trade.Symbol, &direction, &trade.Amount,
		&trade.EntryPrice, &exitPrice, &trade.Payout, &profit, &status,
		&trade.Duration, &trade.IsDemo, &trade.CreatedAt, &trade.ExpiresAt, &closedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("error getting trade: %w", err)
	}

	trade.Direction = models.TradeDirection(direction)
	trade.Status = models.TradeStatus(status)
	if exitPrice != nil {
		trade.ExitPrice = *exitPrice
	}
	if profit != nil {
		trade.Profit = *profit
	}
	trade.ClosedAt = closedAt

	return &trade, nil
}


func (r *PostgresTradeRepository) GetUserTrades(ctx context.Context, userID int64, limit, offset int) ([]*models.Trade, error) {
	query := `
		SELECT id, user_id, symbol, direction, amount, entry_price, exit_price,
		       payout_percentage, profit, status, duration, is_demo,
		       created_at, expires_at, closed_at
		FROM trades 
		WHERE user_id = $1 
		ORDER BY created_at DESC 
		LIMIT $2 OFFSET $3
	`

	rows, err := r.pool.Query(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("error getting user trades: %w", err)
	}
	defer rows.Close()

	return r.scanTrades(rows)
}

func (r *PostgresTradeRepository) GetActiveTrades(ctx context.Context, userID int64) ([]*models.Trade, error) {
	query := `
		SELECT id, user_id, symbol, direction, amount, entry_price, exit_price,
		       payout_percentage, profit, status, duration, is_demo,
		       created_at, expires_at, closed_at
		FROM trades 
		WHERE user_id = $1 AND status = 'active'
		ORDER BY created_at DESC
	`

	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("error getting active trades: %w", err)
	}
	defer rows.Close()

	return r.scanTrades(rows)
}

func (r *PostgresTradeRepository) UpdateTrade(ctx context.Context, trade *models.Trade) error {
	query := `
		UPDATE trades 
		SET exit_price = $1, profit = $2, status = $3, closed_at = $4
		WHERE id = $5
	`

	_, err := r.pool.Exec(ctx, query,
		trade.ExitPrice,
		trade.Profit,
		string(trade.Status),
		trade.ClosedAt,
		trade.ID,
	)

	if err != nil {
		return fmt.Errorf("error updating trade: %w", err)
	}

	return nil
}

func (r *PostgresTradeRepository) GetUserTradeStats(ctx context.Context, userID int64) (*models.TradeStats, error) {
	query := `
		SELECT 
			COUNT(*) as total_trades,
			COALESCE(SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END), 0) as wins,
			COALESCE(SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END), 0) as losses,
			COALESCE(SUM(profit), 0) as total_profit,
			COALESCE(SUM(amount), 0) as total_volume
		FROM trades 
		WHERE user_id = $1 AND status IN ('won', 'lost')
	`

	var stats models.TradeStats
	err := r.pool.QueryRow(ctx, query, userID).Scan(
		&stats.TotalTrades,
		&stats.Wins,
		&stats.Losses,
		&stats.TotalProfit,
		&stats.TotalVolume,
	)

	if err != nil {
		return nil, fmt.Errorf("error getting trade stats: %w", err)
	}

	if stats.TotalTrades > 0 {
		stats.WinRate = float64(stats.Wins) / float64(stats.TotalTrades) * 100
	}

	return &stats, nil
}

func (r *PostgresTradeRepository) GetRecentWinners(ctx context.Context, hours int) ([]int64, error) {
	query := `
		SELECT DISTINCT user_id 
		FROM trades 
		WHERE status = 'won' AND closed_at > NOW() - INTERVAL '1 hour' * $1
	`

	rows, err := r.pool.Query(ctx, query, hours)
	if err != nil {
		return nil, fmt.Errorf("error getting recent winners: %w", err)
	}
	defer rows.Close()

	var winners []int64
	for rows.Next() {
		var userID int64
		if err := rows.Scan(&userID); err != nil {
			return nil, err
		}
		winners = append(winners, userID)
	}

	return winners, nil
}

func (r *PostgresTradeRepository) scanTrades(rows pgx.Rows) ([]*models.Trade, error) {
	var trades []*models.Trade

	for rows.Next() {
		var trade models.Trade
		var direction, status string
		var exitPrice, profit *float64
		var closedAt *time.Time

		err := rows.Scan(
			&trade.ID, &trade.UserID, &trade.Symbol, &direction, &trade.Amount,
			&trade.EntryPrice, &exitPrice, &trade.Payout, &profit, &status,
			&trade.Duration, &trade.IsDemo, &trade.CreatedAt, &trade.ExpiresAt, &closedAt,
		)
		if err != nil {
			return nil, err
		}

		trade.Direction = models.TradeDirection(direction)
		trade.Status = models.TradeStatus(status)
		if exitPrice != nil {
			trade.ExitPrice = *exitPrice
		}
		if profit != nil {
			trade.Profit = *profit
		}
		trade.ClosedAt = closedAt

		trades = append(trades, &trade)
	}

	return trades, nil
}
