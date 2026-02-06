package repositories

import (
	"context"
	"fmt"
	"log"

	"tormentus/internal/models"

	"github.com/jackc/pgx/v5"
)

type PostgresUserRepository struct {
	db *pgx.Conn
}

func NewPostgresUserRepository(db *pgx.Conn) *PostgresUserRepository {
	return &PostgresUserRepository{db: db}
}

func (r *PostgresUserRepository) CreateUser(ctx context.Context, user *models.User) error {
	log.Printf("Repository: Intentando crear usuario con email: %s", user.Email)

	query := `
		INSERT INTO users (email, password, first_name, last_name, role, balance, demo_balance, is_verified, verification_status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		user.Email,
		user.Password,
		user.FirstName,
		user.LastName,
		user.Role,
		user.Balance,
		user.DemoBalance,
		user.IsVerified,
		user.VerificationStatus,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		log.Printf("Repository: Error creando usuario: %v", err)
		return fmt.Errorf("error creating user: %w", err)
	}

	log.Printf("Repository: Usuario creado exitosamente, ID: %d", user.ID)
	return nil
}

func (r *PostgresUserRepository) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	log.Printf("Repository: Buscando usuario con email: %s", email)

	query := `
		SELECT id, email, password, first_name, last_name, role, balance, demo_balance, 
		       is_verified, verification_status, total_deposits, total_withdrawals,
		       total_trades, win_rate, last_win_at, consecutive_wins, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	var user models.User
	err := r.db.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.Balance,
		&user.DemoBalance,
		&user.IsVerified,
		&user.VerificationStatus,
		&user.TotalDeposits,
		&user.TotalWithdrawals,
		&user.TotalTrades,
		&user.WinRate,
		&user.LastWinAt,
		&user.ConsecutiveWins,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		log.Printf("Repository: Error en GetUserByEmail: %v", err)
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("error getting user by email: %w", err)
	}
	log.Printf("Repository: Usuario encontrado: %s", user.Email)
	return &user, nil
}

func (r *PostgresUserRepository) GetUserByID(ctx context.Context, id int64) (*models.User, error) {
	query := `
		SELECT id, email, password, first_name, last_name, role, balance, demo_balance, 
		       is_verified, verification_status, total_deposits, total_withdrawals,
		       total_trades, win_rate, last_win_at, consecutive_wins, created_at, updated_at
		FROM users 
		WHERE id = $1
	`

	var user models.User
	err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.Balance,
		&user.DemoBalance,
		&user.IsVerified,
		&user.VerificationStatus,
		&user.TotalDeposits,
		&user.TotalWithdrawals,
		&user.TotalTrades,
		&user.WinRate,
		&user.LastWinAt,
		&user.ConsecutiveWins,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("error getting user by id: %w", err)
	}

	return &user, nil
}


func (r *PostgresUserRepository) UpdateBalance(ctx context.Context, userID int64, amount float64, isDemo bool) error {
	var query string
	if isDemo {
		query = `UPDATE users SET demo_balance = demo_balance + $1 WHERE id = $2`
	} else {
		query = `UPDATE users SET balance = balance + $1 WHERE id = $2`
	}

	_, err := r.db.Exec(ctx, query, amount, userID)
	if err != nil {
		return fmt.Errorf("error updating balance: %w", err)
	}

	return nil
}

func (r *PostgresUserRepository) UpdateTradeStats(ctx context.Context, userID int64, won bool) error {
	var query string
	if won {
		query = `
			UPDATE users 
			SET total_trades = total_trades + 1,
			    consecutive_wins = consecutive_wins + 1,
			    last_win_at = NOW(),
			    win_rate = (SELECT CAST(SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) AS FLOAT) / 
			               NULLIF(COUNT(*), 0) * 100 FROM trades WHERE user_id = $1 AND status IN ('won', 'lost'))
			WHERE id = $1
		`
	} else {
		query = `
			UPDATE users 
			SET total_trades = total_trades + 1,
			    consecutive_wins = 0,
			    win_rate = (SELECT CAST(SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) AS FLOAT) / 
			               NULLIF(COUNT(*), 0) * 100 FROM trades WHERE user_id = $1 AND status IN ('won', 'lost'))
			WHERE id = $1
		`
	}

	_, err := r.db.Exec(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("error updating trade stats: %w", err)
	}

	return nil
}

func (r *PostgresUserRepository) GetBalance(ctx context.Context, userID int64, isDemo bool) (float64, error) {
	var balance float64
	var query string
	if isDemo {
		query = `SELECT demo_balance FROM users WHERE id = $1`
	} else {
		query = `SELECT balance FROM users WHERE id = $1`
	}

	err := r.db.QueryRow(ctx, query, userID).Scan(&balance)
	if err != nil {
		return 0, fmt.Errorf("error getting balance: %w", err)
	}

	return balance, nil
}


// UpdateUser actualiza los datos del usuario
func (r *PostgresUserRepository) UpdateUser(ctx context.Context, user *models.User) error {
	query := `
		UPDATE users 
		SET first_name = $1, last_name = $2, updated_at = NOW()
		WHERE id = $3
	`
	_, err := r.db.Exec(ctx, query, user.FirstName, user.LastName, user.ID)
	if err != nil {
		return fmt.Errorf("error updating user: %w", err)
	}
	return nil
}

// UpdatePassword actualiza la contraseña del usuario
func (r *PostgresUserRepository) UpdatePassword(ctx context.Context, userID int64, hashedPassword string) error {
	query := `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.db.Exec(ctx, query, hashedPassword, userID)
	if err != nil {
		return fmt.Errorf("error updating password: %w", err)
	}
	return nil
}

// GetUserStats obtiene las estadísticas del usuario
func (r *PostgresUserRepository) GetUserStats(ctx context.Context, userID int64) (*models.UserStats, error) {
	stats := &models.UserStats{}

	// Obtener datos básicos del usuario
	userQuery := `
		SELECT total_trades, win_rate, total_deposits, total_withdrawals
		FROM users WHERE id = $1
	`
	err := r.db.QueryRow(ctx, userQuery, userID).Scan(
		&stats.TotalTrades, &stats.WinRate, &stats.TotalDeposits, &stats.TotalWithdrawals,
	)
	if err != nil && err != pgx.ErrNoRows {
		return nil, fmt.Errorf("error getting user data: %w", err)
	}

	// Obtener estadísticas de trades
	tradesQuery := `
		SELECT 
			COALESCE(COUNT(*) FILTER (WHERE status = 'won'), 0) as won,
			COALESCE(COUNT(*) FILTER (WHERE status = 'lost'), 0) as lost,
			COALESCE(SUM(profit) FILTER (WHERE profit > 0), 0) as total_profit,
			COALESCE(ABS(SUM(profit) FILTER (WHERE profit < 0)), 0) as total_loss,
			COALESCE(MAX(profit), 0) as best_trade,
			COALESCE(MIN(profit), 0) as worst_trade,
			COALESCE(AVG(amount), 0) as avg_amount
		FROM trades WHERE user_id = $1 AND status IN ('won', 'lost')
	`
	err = r.db.QueryRow(ctx, tradesQuery, userID).Scan(
		&stats.WonTrades, &stats.LostTrades, &stats.TotalProfit, &stats.TotalLoss,
		&stats.BestTrade, &stats.WorstTrade, &stats.AvgTradeAmount,
	)
	if err != nil && err != pgx.ErrNoRows {
		return nil, fmt.Errorf("error getting trade stats: %w", err)
	}

	stats.NetProfit = stats.TotalProfit - stats.TotalLoss

	// Contar torneos
	tournamentQuery := `SELECT COUNT(*) FROM tournament_participants WHERE user_id = $1`
	r.db.QueryRow(ctx, tournamentQuery, userID).Scan(&stats.TournamentsJoined)

	return stats, nil
}

// GetUserSettings obtiene la configuración del usuario
func (r *PostgresUserRepository) GetUserSettings(ctx context.Context, userID int64) (*models.UserSettings, error) {
	query := `
		SELECT id, user_id, theme, language, timezone, currency, 
		       sound_effects, show_balance, confirm_trades, default_amount, default_duration
		FROM user_settings WHERE user_id = $1
	`
	var settings models.UserSettings
	err := r.db.QueryRow(ctx, query, userID).Scan(
		&settings.ID, &settings.UserID, &settings.Theme, &settings.Language,
		&settings.Timezone, &settings.Currency, &settings.SoundEffects,
		&settings.ShowBalance, &settings.ConfirmTrades, &settings.DefaultAmount, &settings.DefaultDuration,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("error getting user settings: %w", err)
	}
	return &settings, nil
}

// SaveUserSettings guarda la configuración del usuario
func (r *PostgresUserRepository) SaveUserSettings(ctx context.Context, settings *models.UserSettings) error {
	query := `
		INSERT INTO user_settings (user_id, theme, language, timezone, currency, 
		                           sound_effects, show_balance, confirm_trades, default_amount, default_duration)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		ON CONFLICT (user_id) DO UPDATE SET
			theme = EXCLUDED.theme,
			language = EXCLUDED.language,
			timezone = EXCLUDED.timezone,
			currency = EXCLUDED.currency,
			sound_effects = EXCLUDED.sound_effects,
			show_balance = EXCLUDED.show_balance,
			confirm_trades = EXCLUDED.confirm_trades,
			default_amount = EXCLUDED.default_amount,
			default_duration = EXCLUDED.default_duration
		RETURNING id
	`
	return r.db.QueryRow(ctx, query,
		settings.UserID, settings.Theme, settings.Language, settings.Timezone, settings.Currency,
		settings.SoundEffects, settings.ShowBalance, settings.ConfirmTrades, settings.DefaultAmount, settings.DefaultDuration,
	).Scan(&settings.ID)
}
