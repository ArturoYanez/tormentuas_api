package repositories

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"tormentus/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresWalletRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresWalletRepository(pool *pgxpool.Pool) *PostgresWalletRepository {
	return &PostgresWalletRepository{pool: pool}
}

// ============ WALLETS ============

func (r *PostgresWalletRepository) GetUserWallets(ctx context.Context, userID int64) ([]*models.Wallet, error) {
	query := `
		SELECT id, user_id, type, balance, currency, is_active, created_at, updated_at
		FROM wallets WHERE user_id = $1 AND is_active = true
	`
	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var wallets []*models.Wallet
	for rows.Next() {
		var w models.Wallet
		var wType string
		err := rows.Scan(&w.ID, &w.UserID, &wType, &w.Balance, &w.Currency, &w.IsActive, &w.CreatedAt, &w.UpdatedAt)
		if err != nil {
			return nil, err
		}
		w.Type = models.WalletType(wType)
		wallets = append(wallets, &w)
	}
	return wallets, nil
}

func (r *PostgresWalletRepository) GetWalletByType(ctx context.Context, userID int64, walletType models.WalletType) (*models.Wallet, error) {
	query := `
		SELECT id, user_id, type, balance, currency, is_active, created_at, updated_at
		FROM wallets WHERE user_id = $1 AND type = $2 AND is_active = true
	`
	var w models.Wallet
	var wType string
	err := r.pool.QueryRow(ctx, query, userID, string(walletType)).Scan(
		&w.ID, &w.UserID, &wType, &w.Balance, &w.Currency, &w.IsActive, &w.CreatedAt, &w.UpdatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	w.Type = models.WalletType(wType)
	return &w, nil
}

func (r *PostgresWalletRepository) CreateWallet(ctx context.Context, wallet *models.Wallet) error {
	query := `
		INSERT INTO wallets (user_id, type, balance, currency, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $6)
		RETURNING id
	`
	now := time.Now()
	return r.pool.QueryRow(ctx, query,
		wallet.UserID, string(wallet.Type), wallet.Balance, wallet.Currency, true, now,
	).Scan(&wallet.ID)
}

func (r *PostgresWalletRepository) UpdateWalletBalance(ctx context.Context, walletID int64, amount float64) error {
	query := `UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE id = $2`
	_, err := r.pool.Exec(ctx, query, amount, walletID)
	return err
}


func (r *PostgresWalletRepository) GetWalletSummary(ctx context.Context, userID int64) (*models.WalletSummary, error) {
	summary := &models.WalletSummary{}

	// Get wallet balances
	walletQuery := `SELECT type, balance FROM wallets WHERE user_id = $1 AND is_active = true`
	rows, err := r.pool.Query(ctx, walletQuery, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var wType string
		var balance float64
		if err := rows.Scan(&wType, &balance); err != nil {
			return nil, err
		}
		switch models.WalletType(wType) {
		case models.WalletLive:
			summary.LiveBalance = balance
		case models.WalletDemo:
			summary.DemoBalance = balance
		case models.WalletBonus:
			summary.BonusBalance = balance
		}
	}

	// Get pending withdrawals
	pendingQuery := `SELECT COALESCE(SUM(amount), 0) FROM withdrawal_requests WHERE user_id = $1 AND status = 'pending'`
	r.pool.QueryRow(ctx, pendingQuery, userID).Scan(&summary.PendingWithdrawal)

	// Get total deposits
	depositQuery := `SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = $1 AND type = 'deposit' AND status = 'completed'`
	r.pool.QueryRow(ctx, depositQuery, userID).Scan(&summary.TotalDeposits)

	// Get total withdrawals
	withdrawQuery := `SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = $1 AND type = 'withdrawal' AND status = 'completed'`
	r.pool.QueryRow(ctx, withdrawQuery, userID).Scan(&summary.TotalWithdrawals)

	return summary, nil
}

// ============ TRANSACTIONS ============

func (r *PostgresWalletRepository) CreateTransaction(ctx context.Context, tx *models.Transaction) error {
	query := `
		INSERT INTO transactions (user_id, wallet_id, type, amount, currency, status, tx_hash, address, network, fee, notes, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id
	`
	return r.pool.QueryRow(ctx, query,
		tx.UserID, tx.WalletID, string(tx.Type), tx.Amount, tx.Currency, string(tx.Status),
		tx.TxHash, tx.Address, tx.Network, tx.Fee, tx.Notes, time.Now(),
	).Scan(&tx.ID)
}

func (r *PostgresWalletRepository) GetUserTransactions(ctx context.Context, userID int64, txType string, limit, offset int) ([]*models.Transaction, error) {
	query := `
		SELECT id, user_id, wallet_id, type, amount, currency, status, tx_hash, address, network, fee, notes, processed_by, processed_at, created_at
		FROM transactions WHERE user_id = $1
	`
	args := []interface{}{userID}
	argIdx := 2

	if txType != "" && txType != "all" {
		query += fmt.Sprintf(" AND type = $%d", argIdx)
		args = append(args, txType)
		argIdx++
	}

	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d OFFSET $%d", argIdx, argIdx+1)
	args = append(args, limit, offset)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return r.scanTransactions(rows)
}

func (r *PostgresWalletRepository) GetTransactionByID(ctx context.Context, id int64) (*models.Transaction, error) {
	query := `
		SELECT id, user_id, wallet_id, type, amount, currency, status, tx_hash, address, network, fee, notes, processed_by, processed_at, created_at
		FROM transactions WHERE id = $1
	`
	var tx models.Transaction
	var txType, status string
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&tx.ID, &tx.UserID, &tx.WalletID, &txType, &tx.Amount, &tx.Currency, &status,
		&tx.TxHash, &tx.Address, &tx.Network, &tx.Fee, &tx.Notes, &tx.ProcessedBy, &tx.ProcessedAt, &tx.CreatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	tx.Type = models.TransactionType(txType)
	tx.Status = models.TransactionStatus(status)
	return &tx, nil
}

func (r *PostgresWalletRepository) UpdateTransactionStatus(ctx context.Context, id int64, status models.TransactionStatus) error {
	query := `UPDATE transactions SET status = $1, processed_at = NOW() WHERE id = $2`
	_, err := r.pool.Exec(ctx, query, string(status), id)
	return err
}

func (r *PostgresWalletRepository) scanTransactions(rows pgx.Rows) ([]*models.Transaction, error) {
	var transactions []*models.Transaction
	for rows.Next() {
		var tx models.Transaction
		var txType, status string
		err := rows.Scan(
			&tx.ID, &tx.UserID, &tx.WalletID, &txType, &tx.Amount, &tx.Currency, &status,
			&tx.TxHash, &tx.Address, &tx.Network, &tx.Fee, &tx.Notes, &tx.ProcessedBy, &tx.ProcessedAt, &tx.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		tx.Type = models.TransactionType(txType)
		tx.Status = models.TransactionStatus(status)
		transactions = append(transactions, &tx)
	}
	return transactions, nil
}


// ============ WITHDRAWALS ============

func (r *PostgresWalletRepository) CreateWithdrawalRequest(ctx context.Context, req *models.WithdrawalRequest) error {
	query := `
		INSERT INTO withdrawal_requests (user_id, wallet_id, amount, currency, network, address, fee, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id
	`
	return r.pool.QueryRow(ctx, query,
		req.UserID, req.WalletID, req.Amount, req.Currency, req.Network, req.Address, req.Fee, "pending", time.Now(),
	).Scan(&req.ID)
}

func (r *PostgresWalletRepository) GetUserWithdrawals(ctx context.Context, userID int64, status string, limit, offset int) ([]*models.WithdrawalRequest, error) {
	query := `
		SELECT id, user_id, wallet_id, amount, currency, network, address, fee, status, rejection_reason, processed_by, processed_at, created_at
		FROM withdrawal_requests WHERE user_id = $1
	`
	args := []interface{}{userID}
	argIdx := 2

	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND status = $%d", argIdx)
		args = append(args, status)
		argIdx++
	}

	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d OFFSET $%d", argIdx, argIdx+1)
	args = append(args, limit, offset)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var withdrawals []*models.WithdrawalRequest
	for rows.Next() {
		var w models.WithdrawalRequest
		var status string
		err := rows.Scan(
			&w.ID, &w.UserID, &w.WalletID, &w.Amount, &w.Currency, &w.Network, &w.Address,
			&w.Fee, &status, &w.RejectionReason, &w.ProcessedBy, &w.ProcessedAt, &w.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		w.Status = models.TransactionStatus(status)
		withdrawals = append(withdrawals, &w)
	}
	return withdrawals, nil
}

func (r *PostgresWalletRepository) GetWithdrawalByID(ctx context.Context, id int64) (*models.WithdrawalRequest, error) {
	query := `
		SELECT id, user_id, wallet_id, amount, currency, network, address, fee, status, rejection_reason, processed_by, processed_at, created_at
		FROM withdrawal_requests WHERE id = $1
	`
	var w models.WithdrawalRequest
	var status string
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&w.ID, &w.UserID, &w.WalletID, &w.Amount, &w.Currency, &w.Network, &w.Address,
		&w.Fee, &status, &w.RejectionReason, &w.ProcessedBy, &w.ProcessedAt, &w.CreatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	w.Status = models.TransactionStatus(status)
	return &w, nil
}

func (r *PostgresWalletRepository) CancelWithdrawal(ctx context.Context, id int64, userID int64) error {
	query := `UPDATE withdrawal_requests SET status = 'cancelled' WHERE id = $1 AND user_id = $2 AND status = 'pending'`
	result, err := r.pool.Exec(ctx, query, id, userID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("withdrawal not found or cannot be cancelled")
	}
	return nil
}

func (r *PostgresWalletRepository) GetPendingWithdrawalAmount(ctx context.Context, userID int64) (float64, error) {
	query := `SELECT COALESCE(SUM(amount), 0) FROM withdrawal_requests WHERE user_id = $1 AND status = 'pending'`
	var amount float64
	err := r.pool.QueryRow(ctx, query, userID).Scan(&amount)
	return amount, err
}

// ============ DEPOSIT ADDRESSES ============

func (r *PostgresWalletRepository) GetDepositAddress(ctx context.Context, userID int64, currency, network string) (*models.DepositAddress, error) {
	query := `
		SELECT id, user_id, currency, network, address, is_active, created_at
		FROM deposit_addresses WHERE user_id = $1 AND currency = $2 AND network = $3 AND is_active = true
	`
	var addr models.DepositAddress
	err := r.pool.QueryRow(ctx, query, userID, currency, network).Scan(
		&addr.ID, &addr.UserID, &addr.Currency, &addr.Network, &addr.Address, &addr.IsActive, &addr.CreatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &addr, nil
}

func (r *PostgresWalletRepository) CreateDepositAddress(ctx context.Context, addr *models.DepositAddress) error {
	// Generate a mock address (in production, integrate with crypto wallet service)
	addr.Address = generateMockAddress(addr.Currency, addr.Network)
	
	query := `
		INSERT INTO deposit_addresses (user_id, currency, network, address, is_active, created_at)
		VALUES ($1, $2, $3, $4, true, $5)
		RETURNING id
	`
	return r.pool.QueryRow(ctx, query,
		addr.UserID, addr.Currency, addr.Network, addr.Address, time.Now(),
	).Scan(&addr.ID)
}

// generateMockAddress genera una dirección mock para desarrollo
func generateMockAddress(currency, network string) string {
	bytes := make([]byte, 20)
	rand.Read(bytes)
	hash := hex.EncodeToString(bytes)

	switch network {
	case "TRC20":
		return "T" + hash[:33]
	case "ERC20", "BEP20":
		return "0x" + hash[:40]
	case "BTC":
		return "bc1q" + hash[:38]
	case "SOL":
		return hash[:44]
	default:
		return hash[:42]
	}
}
