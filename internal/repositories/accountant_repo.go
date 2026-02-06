package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// AccountantRepository maneja las operaciones de BD para el contador
type AccountantRepository struct {
	pool *pgxpool.Pool
}

// NewAccountantRepository crea un nuevo repositorio
func NewAccountantRepository(pool *pgxpool.Pool) *AccountantRepository {
	return &AccountantRepository{pool: pool}
}

// ========== DASHBOARD STATS ==========

// AccountantDashboardStats estadísticas del dashboard
type AccountantDashboardStats struct {
	PendingWithdrawals     int     `json:"pending_withdrawals"`
	PendingDeposits        int     `json:"pending_deposits"`
	TodayApproved          int     `json:"today_approved"`
	TodayRejected          int     `json:"today_rejected"`
	TotalPendingAmount     float64 `json:"total_pending_amount"`
	TodayVolume            float64 `json:"today_volume"`
	PendingPrizes          int     `json:"pending_prizes"`
	OpenAlerts             int     `json:"open_alerts"`
	PendingInvoices        int     `json:"pending_invoices"`
	UnreconciledItems      int     `json:"unreconciled_items"`
}

// GetDashboardStats obtiene estadísticas del dashboard
func (r *AccountantRepository) GetDashboardStats(ctx context.Context) (*AccountantDashboardStats, error) {
	stats := &AccountantDashboardStats{}
	
	// Pending withdrawals
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM withdrawal_requests WHERE status = 'pending'").Scan(&stats.PendingWithdrawals)
	
	// Pending deposits
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM deposit_requests WHERE status = 'pending'").Scan(&stats.PendingDeposits)
	
	// Today approved/rejected
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM withdrawal_requests WHERE status = 'approved' AND DATE(processed_at) = CURRENT_DATE").Scan(&stats.TodayApproved)
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM withdrawal_requests WHERE status = 'rejected' AND DATE(processed_at) = CURRENT_DATE").Scan(&stats.TodayRejected)
	
	// Total pending amount
	r.pool.QueryRow(ctx, "SELECT COALESCE(SUM(amount), 0) FROM withdrawal_requests WHERE status = 'pending'").Scan(&stats.TotalPendingAmount)
	
	// Today volume
	r.pool.QueryRow(ctx, `
		SELECT COALESCE(SUM(amount), 0) FROM (
			SELECT amount FROM withdrawal_requests WHERE DATE(created_at) = CURRENT_DATE
			UNION ALL
			SELECT amount FROM deposit_requests WHERE DATE(created_at) = CURRENT_DATE
		) t
	`).Scan(&stats.TodayVolume)
	
	// Pending prizes
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM tournament_prizes WHERE status = 'pending'").Scan(&stats.PendingPrizes)
	
	// Open alerts
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM suspicious_alerts WHERE status = 'pending'").Scan(&stats.OpenAlerts)
	
	// Pending invoices
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM invoices WHERE status = 'pending'").Scan(&stats.PendingInvoices)
	
	return stats, nil
}

// ========== WITHDRAWALS ==========

// WithdrawalRequest solicitud de retiro
type WithdrawalRequest struct {
	ID                   int64      `json:"id"`
	UserID               int64      `json:"user_id"`
	UserName             string     `json:"user_name"`
	UserEmail            string     `json:"user_email"`
	Amount               float64    `json:"amount"`
	Currency             string     `json:"currency"`
	Method               string     `json:"method"`
	Network              string     `json:"network"`
	WalletAddress        string     `json:"wallet_address"`
	UserBalanceAtRequest float64    `json:"user_balance_at_request"`
	Status               string     `json:"status"`
	Priority             string     `json:"priority"`
	RiskScore            int        `json:"risk_score"`
	RiskFlags            []string   `json:"risk_flags"`
	ProcessedBy          *int64     `json:"processed_by"`
	ProcessedByName      *string    `json:"processed_by_name"`
	ProcessedAt          *time.Time `json:"processed_at"`
	RejectionReason      string     `json:"rejection_reason"`
	TxHash               string     `json:"tx_hash"`
	FeeAmount            float64    `json:"fee_amount"`
	NetAmount            float64    `json:"net_amount"`
	Notes                string     `json:"notes"`
	CreatedAt            time.Time  `json:"created_at"`
}

// GetWithdrawals obtiene solicitudes de retiro
func (r *AccountantRepository) GetWithdrawals(ctx context.Context, status, priority string, limit int) ([]*WithdrawalRequest, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT w.id, w.user_id, 
			COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			COALESCE(u.email, '') as user_email,
			w.amount, w.currency, w.method, COALESCE(w.network, '') as network,
			COALESCE(w.wallet_address, '') as wallet_address,
			COALESCE(w.user_balance_at_request, 0) as user_balance,
			w.status, w.priority, COALESCE(w.risk_score, 0) as risk_score,
			COALESCE(w.risk_flags, '[]') as risk_flags,
			w.processed_by, 
			COALESCE(a.first_name || ' ' || a.last_name, NULL) as processed_by_name,
			w.processed_at, COALESCE(w.rejection_reason, '') as rejection_reason,
			COALESCE(w.tx_hash, '') as tx_hash, COALESCE(w.fee_amount, 0) as fee_amount,
			COALESCE(w.net_amount, w.amount) as net_amount, COALESCE(w.notes, '') as notes,
			w.created_at
		FROM withdrawal_requests w
		LEFT JOIN users u ON w.user_id = u.id
		LEFT JOIN users a ON w.processed_by = a.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1

	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND w.status = $%d", argNum)
		args = append(args, status)
		argNum++
	}
	if priority != "" && priority != "all" {
		query += fmt.Sprintf(" AND w.priority = $%d", argNum)
		args = append(args, priority)
		argNum++
	}

	query += fmt.Sprintf(" ORDER BY w.created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var withdrawals []*WithdrawalRequest
	for rows.Next() {
		w := &WithdrawalRequest{}
		if err := rows.Scan(&w.ID, &w.UserID, &w.UserName, &w.UserEmail, &w.Amount, &w.Currency,
			&w.Method, &w.Network, &w.WalletAddress, &w.UserBalanceAtRequest, &w.Status, &w.Priority,
			&w.RiskScore, &w.RiskFlags, &w.ProcessedBy, &w.ProcessedByName, &w.ProcessedAt,
			&w.RejectionReason, &w.TxHash, &w.FeeAmount, &w.NetAmount, &w.Notes, &w.CreatedAt); err != nil {
			return nil, err
		}
		withdrawals = append(withdrawals, w)
	}
	return withdrawals, nil
}

// GetWithdrawalByID obtiene un retiro por ID
func (r *AccountantRepository) GetWithdrawalByID(ctx context.Context, id int64) (*WithdrawalRequest, error) {
	query := `
		SELECT w.id, w.user_id, 
			COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			COALESCE(u.email, '') as user_email,
			w.amount, w.currency, w.method, COALESCE(w.network, '') as network,
			COALESCE(w.wallet_address, '') as wallet_address,
			COALESCE(w.user_balance_at_request, 0) as user_balance,
			w.status, w.priority, COALESCE(w.risk_score, 0) as risk_score,
			COALESCE(w.risk_flags, '[]') as risk_flags,
			w.processed_by, 
			COALESCE(a.first_name || ' ' || a.last_name, NULL) as processed_by_name,
			w.processed_at, COALESCE(w.rejection_reason, '') as rejection_reason,
			COALESCE(w.tx_hash, '') as tx_hash, COALESCE(w.fee_amount, 0) as fee_amount,
			COALESCE(w.net_amount, w.amount) as net_amount, COALESCE(w.notes, '') as notes,
			w.created_at
		FROM withdrawal_requests w
		LEFT JOIN users u ON w.user_id = u.id
		LEFT JOIN users a ON w.processed_by = a.id
		WHERE w.id = $1
	`
	w := &WithdrawalRequest{}
	err := r.pool.QueryRow(ctx, query, id).Scan(&w.ID, &w.UserID, &w.UserName, &w.UserEmail, &w.Amount, &w.Currency,
		&w.Method, &w.Network, &w.WalletAddress, &w.UserBalanceAtRequest, &w.Status, &w.Priority,
		&w.RiskScore, &w.RiskFlags, &w.ProcessedBy, &w.ProcessedByName, &w.ProcessedAt,
		&w.RejectionReason, &w.TxHash, &w.FeeAmount, &w.NetAmount, &w.Notes, &w.CreatedAt)
	return w, err
}

// ApproveWithdrawal aprueba un retiro
func (r *AccountantRepository) ApproveWithdrawal(ctx context.Context, id, accountantID int64, txHash, notes string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE withdrawal_requests 
		SET status = 'approved', processed_by = $1, processed_at = NOW(), tx_hash = $2, notes = $3, updated_at = NOW()
		WHERE id = $4
	`, accountantID, txHash, notes, id)
	if err != nil {
		return err
	}
	// Log approval
	r.pool.Exec(ctx, `
		INSERT INTO withdrawal_approvals (withdrawal_id, accountant_id, action, amount, reason)
		SELECT $1, $2, 'approved', amount, $3 FROM withdrawal_requests WHERE id = $1
	`, id, accountantID, notes)
	return nil
}

// RejectWithdrawal rechaza un retiro
func (r *AccountantRepository) RejectWithdrawal(ctx context.Context, id, accountantID int64, reason string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE withdrawal_requests 
		SET status = 'rejected', processed_by = $1, processed_at = NOW(), rejection_reason = $2, updated_at = NOW()
		WHERE id = $3
	`, accountantID, reason, id)
	if err != nil {
		return err
	}
	r.pool.Exec(ctx, `
		INSERT INTO withdrawal_approvals (withdrawal_id, accountant_id, action, amount, reason)
		SELECT $1, $2, 'rejected', amount, $3 FROM withdrawal_requests WHERE id = $1
	`, id, accountantID, reason)
	return nil
}

// ========== DEPOSITS ==========

// DepositRequest solicitud de depósito
type DepositRequest struct {
	ID                    int64      `json:"id"`
	UserID                int64      `json:"user_id"`
	UserName              string     `json:"user_name"`
	UserEmail             string     `json:"user_email"`
	Amount                float64    `json:"amount"`
	Currency              string     `json:"currency"`
	Method                string     `json:"method"`
	Network               string     `json:"network"`
	TxHash                string     `json:"tx_hash"`
	FromAddress           string     `json:"from_address"`
	ToAddress             string     `json:"to_address"`
	Confirmations         int        `json:"confirmations"`
	RequiredConfirmations int        `json:"required_confirmations"`
	Status                string     `json:"status"`
	ConfirmedBy           *int64     `json:"confirmed_by"`
	ConfirmedByName       *string    `json:"confirmed_by_name"`
	ConfirmedAt           *time.Time `json:"confirmed_at"`
	CreditedAmount        float64    `json:"credited_amount"`
	FeeAmount             float64    `json:"fee_amount"`
	Notes                 string     `json:"notes"`
	CreatedAt             time.Time  `json:"created_at"`
}

// GetDeposits obtiene solicitudes de depósito
func (r *AccountantRepository) GetDeposits(ctx context.Context, status string, limit int) ([]*DepositRequest, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT d.id, d.user_id, 
			COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			COALESCE(u.email, '') as user_email,
			d.amount, d.currency, d.method, COALESCE(d.network, '') as network,
			COALESCE(d.tx_hash, '') as tx_hash, COALESCE(d.from_address, '') as from_address,
			COALESCE(d.to_address, '') as to_address, d.confirmations, d.required_confirmations,
			d.status, d.confirmed_by,
			COALESCE(a.first_name || ' ' || a.last_name, NULL) as confirmed_by_name,
			d.confirmed_at, COALESCE(d.credited_amount, d.amount) as credited_amount,
			COALESCE(d.fee_amount, 0) as fee_amount, COALESCE(d.notes, '') as notes, d.created_at
		FROM deposit_requests d
		LEFT JOIN users u ON d.user_id = u.id
		LEFT JOIN users a ON d.confirmed_by = a.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1

	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND d.status = $%d", argNum)
		args = append(args, status)
		argNum++
	}

	query += fmt.Sprintf(" ORDER BY d.created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var deposits []*DepositRequest
	for rows.Next() {
		d := &DepositRequest{}
		if err := rows.Scan(&d.ID, &d.UserID, &d.UserName, &d.UserEmail, &d.Amount, &d.Currency,
			&d.Method, &d.Network, &d.TxHash, &d.FromAddress, &d.ToAddress, &d.Confirmations,
			&d.RequiredConfirmations, &d.Status, &d.ConfirmedBy, &d.ConfirmedByName, &d.ConfirmedAt,
			&d.CreditedAmount, &d.FeeAmount, &d.Notes, &d.CreatedAt); err != nil {
			return nil, err
		}
		deposits = append(deposits, d)
	}
	return deposits, nil
}

// ConfirmDeposit confirma un depósito
func (r *AccountantRepository) ConfirmDeposit(ctx context.Context, id, accountantID int64, creditedAmount float64, notes string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE deposit_requests 
		SET status = 'confirmed', confirmed_by = $1, confirmed_at = NOW(), credited_amount = $2, notes = $3, updated_at = NOW()
		WHERE id = $4
	`, accountantID, creditedAmount, notes, id)
	if err != nil {
		return err
	}
	r.pool.Exec(ctx, `
		INSERT INTO deposit_confirmations (deposit_id, accountant_id, action, verified_tx_hash, verified_amount, notes)
		VALUES ($1, $2, 'confirmed', true, true, $3)
	`, id, accountantID, notes)
	return nil
}

// RejectDeposit rechaza un depósito
func (r *AccountantRepository) RejectDeposit(ctx context.Context, id, accountantID int64, reason string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE deposit_requests 
		SET status = 'rejected', confirmed_by = $1, confirmed_at = NOW(), rejection_reason = $2, updated_at = NOW()
		WHERE id = $3
	`, accountantID, reason, id)
	return err
}

// ========== TOURNAMENT PRIZES ==========

// TournamentPrize premio de torneo
type TournamentPrize struct {
	ID             int64      `json:"id"`
	TournamentID   int64      `json:"tournament_id"`
	TournamentName string     `json:"tournament_name"`
	UserID         int64      `json:"user_id"`
	UserName       string     `json:"user_name"`
	UserEmail      string     `json:"user_email"`
	Position       int        `json:"position"`
	PrizeAmount    float64    `json:"prize_amount"`
	PrizeType      string     `json:"prize_type"`
	Status         string     `json:"status"`
	PaidBy         *int64     `json:"paid_by"`
	PaidByName     *string    `json:"paid_by_name"`
	PaidAt         *time.Time `json:"paid_at"`
	PaymentMethod  string     `json:"payment_method"`
	TxReference    string     `json:"tx_reference"`
	Notes          string     `json:"notes"`
	CreatedAt      time.Time  `json:"created_at"`
}

// GetTournamentPrizes obtiene premios de torneos
func (r *AccountantRepository) GetTournamentPrizes(ctx context.Context, status string, limit int) ([]*TournamentPrize, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT p.id, COALESCE(p.tournament_id, 0) as tournament_id, 
			COALESCE(p.tournament_name, 'Torneo') as tournament_name,
			p.user_id, COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			COALESCE(u.email, '') as user_email, p.position, p.prize_amount, p.prize_type,
			p.status, p.paid_by, 
			COALESCE(a.first_name || ' ' || a.last_name, NULL) as paid_by_name,
			p.paid_at, COALESCE(p.payment_method, '') as payment_method,
			COALESCE(p.tx_reference, '') as tx_reference, COALESCE(p.notes, '') as notes, p.created_at
		FROM tournament_prizes p
		LEFT JOIN users u ON p.user_id = u.id
		LEFT JOIN users a ON p.paid_by = a.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1

	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND p.status = $%d", argNum)
		args = append(args, status)
		argNum++
	}

	query += fmt.Sprintf(" ORDER BY p.created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var prizes []*TournamentPrize
	for rows.Next() {
		p := &TournamentPrize{}
		if err := rows.Scan(&p.ID, &p.TournamentID, &p.TournamentName, &p.UserID, &p.UserName,
			&p.UserEmail, &p.Position, &p.PrizeAmount, &p.PrizeType, &p.Status, &p.PaidBy,
			&p.PaidByName, &p.PaidAt, &p.PaymentMethod, &p.TxReference, &p.Notes, &p.CreatedAt); err != nil {
			return nil, err
		}
		prizes = append(prizes, p)
	}
	return prizes, nil
}

// PayPrize paga un premio
func (r *AccountantRepository) PayPrize(ctx context.Context, id, accountantID int64, paymentMethod, txReference, notes string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE tournament_prizes 
		SET status = 'paid', paid_by = $1, paid_at = NOW(), payment_method = $2, tx_reference = $3, notes = $4, updated_at = NOW()
		WHERE id = $5
	`, accountantID, paymentMethod, txReference, notes, id)
	if err != nil {
		return err
	}
	r.pool.Exec(ctx, `
		INSERT INTO prize_payments (prize_id, accountant_id, amount, payment_method, tx_hash, status, processed_at)
		SELECT $1, $2, prize_amount, $3, $4, 'completed', NOW() FROM tournament_prizes WHERE id = $1
	`, id, accountantID, paymentMethod, txReference)
	return nil
}

// ========== USER FINANCIAL PROFILES ==========

// UserFinancialProfile perfil financiero de usuario
type UserFinancialProfile struct {
	ID                 int64      `json:"id"`
	UserID             int64      `json:"user_id"`
	UserName           string     `json:"user_name"`
	UserEmail          string     `json:"user_email"`
	CurrentBalance     float64    `json:"current_balance"`
	TotalDeposits      float64    `json:"total_deposits"`
	TotalWithdrawals   float64    `json:"total_withdrawals"`
	TotalBonuses       float64    `json:"total_bonuses"`
	TotalPrizes        float64    `json:"total_prizes"`
	TotalTradingVolume float64    `json:"total_trading_volume"`
	NetProfitLoss      float64    `json:"net_profit_loss"`
	RiskLevel          string     `json:"risk_level"`
	FinancialStatus    string     `json:"financial_status"`
	LastDepositAt      *time.Time `json:"last_deposit_at"`
	LastWithdrawalAt   *time.Time `json:"last_withdrawal_at"`
	CreatedAt          time.Time  `json:"created_at"`
}

// GetUserFinancialProfiles obtiene perfiles financieros
func (r *AccountantRepository) GetUserFinancialProfiles(ctx context.Context, search string, riskLevel string, limit int) ([]*UserFinancialProfile, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT p.id, p.user_id, 
			COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			COALESCE(u.email, '') as user_email,
			p.current_balance, p.total_deposits, p.total_withdrawals, p.total_bonuses,
			p.total_prizes, p.total_trading_volume, p.net_profit_loss, p.risk_level,
			p.financial_status, p.last_deposit_at, p.last_withdrawal_at, p.created_at
		FROM user_financial_profiles p
		LEFT JOIN users u ON p.user_id = u.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1

	if search != "" {
		query += fmt.Sprintf(" AND (u.email ILIKE $%d OR u.first_name ILIKE $%d OR u.last_name ILIKE $%d)", argNum, argNum, argNum)
		args = append(args, "%"+search+"%")
		argNum++
	}
	if riskLevel != "" && riskLevel != "all" {
		query += fmt.Sprintf(" AND p.risk_level = $%d", argNum)
		args = append(args, riskLevel)
		argNum++
	}

	query += fmt.Sprintf(" ORDER BY p.current_balance DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var profiles []*UserFinancialProfile
	for rows.Next() {
		p := &UserFinancialProfile{}
		if err := rows.Scan(&p.ID, &p.UserID, &p.UserName, &p.UserEmail, &p.CurrentBalance,
			&p.TotalDeposits, &p.TotalWithdrawals, &p.TotalBonuses, &p.TotalPrizes,
			&p.TotalTradingVolume, &p.NetProfitLoss, &p.RiskLevel, &p.FinancialStatus,
			&p.LastDepositAt, &p.LastWithdrawalAt, &p.CreatedAt); err != nil {
			return nil, err
		}
		profiles = append(profiles, p)
	}
	return profiles, nil
}

// AdjustUserBalance ajusta el balance de un usuario
func (r *AccountantRepository) AdjustUserBalance(ctx context.Context, userID, accountantID int64, adjustmentType string, amount float64, reason string) error {
	// Get current balance
	var currentBalance float64
	r.pool.QueryRow(ctx, "SELECT COALESCE(current_balance, 0) FROM user_financial_profiles WHERE user_id = $1", userID).Scan(&currentBalance)
	
	newBalance := currentBalance + amount
	
	// Create adjustment record
	_, err := r.pool.Exec(ctx, `
		INSERT INTO user_balance_adjustments (user_id, accountant_id, adjustment_type, amount, balance_before, balance_after, reason, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved')
	`, userID, accountantID, adjustmentType, amount, currentBalance, newBalance, reason)
	if err != nil {
		return err
	}
	
	// Update balance
	_, err = r.pool.Exec(ctx, `
		UPDATE user_financial_profiles SET current_balance = $1, updated_at = NOW() WHERE user_id = $2
	`, newBalance, userID)
	return err
}

// ========== COMMISSIONS ==========

// Commission comisión
type Commission struct {
	ID                 int64     `json:"id"`
	CommissionTypeID   int64     `json:"commission_type_id"`
	CommissionTypeName string    `json:"commission_type_name"`
	SourceType         string    `json:"source_type"`
	SourceID           int64     `json:"source_id"`
	UserID             int64     `json:"user_id"`
	UserName           string    `json:"user_name"`
	Amount             float64   `json:"amount"`
	PercentageApplied  float64   `json:"percentage_applied"`
	BaseAmount         float64   `json:"base_amount"`
	Currency           string    `json:"currency"`
	Description        string    `json:"description"`
	Status             string    `json:"status"`
	CollectedAt        time.Time `json:"collected_at"`
}

// GetCommissions obtiene comisiones
func (r *AccountantRepository) GetCommissions(ctx context.Context, sourceType string, limit int) ([]*Commission, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT c.id, c.commission_type_id, COALESCE(ct.name, 'Comisión') as type_name,
			c.source_type, COALESCE(c.source_id, 0) as source_id, COALESCE(c.user_id, 0) as user_id,
			COALESCE(u.first_name || ' ' || u.last_name, 'N/A') as user_name,
			c.amount, COALESCE(c.percentage_applied, 0) as percentage, COALESCE(c.base_amount, 0) as base,
			c.currency, COALESCE(c.description, '') as description, c.status, c.collected_at
		FROM commissions c
		LEFT JOIN commission_types ct ON c.commission_type_id = ct.id
		LEFT JOIN users u ON c.user_id = u.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if sourceType != "" && sourceType != "all" {
		query += fmt.Sprintf(" AND c.source_type = $%d", argNum)
		args = append(args, sourceType)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY c.collected_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var commissions []*Commission
	for rows.Next() {
		c := &Commission{}
		if err := rows.Scan(&c.ID, &c.CommissionTypeID, &c.CommissionTypeName, &c.SourceType, &c.SourceID,
			&c.UserID, &c.UserName, &c.Amount, &c.PercentageApplied, &c.BaseAmount, &c.Currency,
			&c.Description, &c.Status, &c.CollectedAt); err != nil {
			return nil, err
		}
		commissions = append(commissions, c)
	}
	return commissions, nil
}

// CommissionType tipo de comisión
type CommissionType struct {
	ID          int64   `json:"id"`
	Name        string  `json:"name"`
	Code        string  `json:"code"`
	Description string  `json:"description"`
	Percentage  float64 `json:"percentage"`
	FixedAmount float64 `json:"fixed_amount"`
	MinAmount   float64 `json:"min_amount"`
	MaxAmount   float64 `json:"max_amount"`
	AppliesTo   string  `json:"applies_to"`
	IsActive    bool    `json:"is_active"`
}

// GetCommissionTypes obtiene tipos de comisión
func (r *AccountantRepository) GetCommissionTypes(ctx context.Context) ([]*CommissionType, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, name, code, COALESCE(description, '') as description, COALESCE(percentage, 0) as percentage,
			COALESCE(fixed_amount, 0) as fixed, COALESCE(min_amount, 0) as min, COALESCE(max_amount, 0) as max,
			COALESCE(applies_to, '') as applies_to, is_active
		FROM commission_types ORDER BY name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var types []*CommissionType
	for rows.Next() {
		t := &CommissionType{}
		if err := rows.Scan(&t.ID, &t.Name, &t.Code, &t.Description, &t.Percentage, &t.FixedAmount,
			&t.MinAmount, &t.MaxAmount, &t.AppliesTo, &t.IsActive); err != nil {
			return nil, err
		}
		types = append(types, t)
	}
	return types, nil
}

// ========== INVOICES ==========

// Invoice factura
type Invoice struct {
	ID               int64      `json:"id"`
	InvoiceNumber    string     `json:"invoice_number"`
	InvoiceType      string     `json:"invoice_type"`
	ClientName       string     `json:"client_name"`
	ClientEmail      string     `json:"client_email"`
	ClientTaxID      string     `json:"client_tax_id"`
	Amount           float64    `json:"amount"`
	TaxAmount        float64    `json:"tax_amount"`
	TotalAmount      float64    `json:"total_amount"`
	Currency         string     `json:"currency"`
	Description      string     `json:"description"`
	IssueDate        time.Time  `json:"issue_date"`
	DueDate          time.Time  `json:"due_date"`
	PaidDate         *time.Time `json:"paid_date"`
	Status           string     `json:"status"`
	PaymentMethod    string     `json:"payment_method"`
	PaymentReference string     `json:"payment_reference"`
	Notes            string     `json:"notes"`
	CreatedBy        int64      `json:"created_by"`
	CreatedByName    string     `json:"created_by_name"`
	CreatedAt        time.Time  `json:"created_at"`
}

// GetInvoices obtiene facturas
func (r *AccountantRepository) GetInvoices(ctx context.Context, status, invoiceType string, limit int) ([]*Invoice, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT i.id, i.invoice_number, i.invoice_type, i.client_name, COALESCE(i.client_email, '') as email,
			COALESCE(i.client_tax_id, '') as tax_id, i.amount, i.tax_amount, i.total_amount, i.currency,
			COALESCE(i.description, '') as description, i.issue_date, i.due_date, i.paid_date, i.status,
			COALESCE(i.payment_method, '') as payment_method, COALESCE(i.payment_reference, '') as payment_ref,
			COALESCE(i.notes, '') as notes, COALESCE(i.created_by, 0) as created_by,
			COALESCE(a.first_name || ' ' || a.last_name, 'Sistema') as created_by_name, i.created_at
		FROM invoices i
		LEFT JOIN users a ON i.created_by = a.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND i.status = $%d", argNum)
		args = append(args, status)
		argNum++
	}
	if invoiceType != "" && invoiceType != "all" {
		query += fmt.Sprintf(" AND i.invoice_type = $%d", argNum)
		args = append(args, invoiceType)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY i.created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var invoices []*Invoice
	for rows.Next() {
		inv := &Invoice{}
		if err := rows.Scan(&inv.ID, &inv.InvoiceNumber, &inv.InvoiceType, &inv.ClientName, &inv.ClientEmail,
			&inv.ClientTaxID, &inv.Amount, &inv.TaxAmount, &inv.TotalAmount, &inv.Currency, &inv.Description,
			&inv.IssueDate, &inv.DueDate, &inv.PaidDate, &inv.Status, &inv.PaymentMethod, &inv.PaymentReference,
			&inv.Notes, &inv.CreatedBy, &inv.CreatedByName, &inv.CreatedAt); err != nil {
			return nil, err
		}
		invoices = append(invoices, inv)
	}
	return invoices, nil
}

// CreateInvoice crea una factura
func (r *AccountantRepository) CreateInvoice(ctx context.Context, inv *Invoice) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO invoices (invoice_number, invoice_type, client_name, client_email, client_tax_id, amount, tax_amount, total_amount, currency, description, issue_date, due_date, status, notes, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending', $13, $14)
		RETURNING id
	`, inv.InvoiceNumber, inv.InvoiceType, inv.ClientName, inv.ClientEmail, inv.ClientTaxID, inv.Amount, inv.TaxAmount, inv.TotalAmount, inv.Currency, inv.Description, inv.IssueDate, inv.DueDate, inv.Notes, inv.CreatedBy).Scan(&id)
	return id, err
}

// MarkInvoicePaid marca factura como pagada
func (r *AccountantRepository) MarkInvoicePaid(ctx context.Context, id, accountantID int64, paymentMethod, paymentRef string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE invoices SET status = 'paid', paid_date = CURRENT_DATE, paid_by = $1, payment_method = $2, payment_reference = $3, updated_at = NOW()
		WHERE id = $4
	`, accountantID, paymentMethod, paymentRef, id)
	return err
}

// ========== VENDORS ==========

// Vendor proveedor
type Vendor struct {
	ID                     int64     `json:"id"`
	Name                   string    `json:"name"`
	Code                   string    `json:"code"`
	TaxID                  string    `json:"tax_id"`
	Email                  string    `json:"email"`
	Phone                  string    `json:"phone"`
	Address                string    `json:"address"`
	Country                string    `json:"country"`
	Category               string    `json:"category"`
	PaymentTerms           int       `json:"payment_terms"`
	PreferredPaymentMethod string    `json:"preferred_payment_method"`
	ContactPerson          string    `json:"contact_person"`
	Notes                  string    `json:"notes"`
	IsActive               bool      `json:"is_active"`
	TotalInvoices          int       `json:"total_invoices"`
	TotalPaid              float64   `json:"total_paid"`
	CreatedAt              time.Time `json:"created_at"`
}

// GetVendors obtiene proveedores
func (r *AccountantRepository) GetVendors(ctx context.Context, search string, limit int) ([]*Vendor, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT id, name, COALESCE(code, '') as code, COALESCE(tax_id, '') as tax_id, COALESCE(email, '') as email,
			COALESCE(phone, '') as phone, COALESCE(address, '') as address, COALESCE(country, '') as country,
			COALESCE(category, '') as category, payment_terms, COALESCE(preferred_payment_method, '') as payment_method,
			COALESCE(contact_person, '') as contact, COALESCE(notes, '') as notes, is_active,
			total_invoices, total_paid, created_at
		FROM vendors WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if search != "" {
		query += fmt.Sprintf(" AND (name ILIKE $%d OR email ILIKE $%d)", argNum, argNum)
		args = append(args, "%"+search+"%")
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY name LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var vendors []*Vendor
	for rows.Next() {
		v := &Vendor{}
		if err := rows.Scan(&v.ID, &v.Name, &v.Code, &v.TaxID, &v.Email, &v.Phone, &v.Address, &v.Country,
			&v.Category, &v.PaymentTerms, &v.PreferredPaymentMethod, &v.ContactPerson, &v.Notes, &v.IsActive,
			&v.TotalInvoices, &v.TotalPaid, &v.CreatedAt); err != nil {
			return nil, err
		}
		vendors = append(vendors, v)
	}
	return vendors, nil
}

// CreateVendor crea un proveedor
func (r *AccountantRepository) CreateVendor(ctx context.Context, v *Vendor) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO vendors (name, code, tax_id, email, phone, address, country, category, payment_terms, preferred_payment_method, contact_person, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id
	`, v.Name, v.Code, v.TaxID, v.Email, v.Phone, v.Address, v.Country, v.Category, v.PaymentTerms, v.PreferredPaymentMethod, v.ContactPerson, v.Notes).Scan(&id)
	return id, err
}

// ========== BANK ACCOUNTS ==========

// BankAccount cuenta bancaria
type BankAccount struct {
	ID               int64      `json:"id"`
	AccountName      string     `json:"account_name"`
	AccountNumber    string     `json:"account_number"`
	BankName         string     `json:"bank_name"`
	BankCode         string     `json:"bank_code"`
	SwiftCode        string     `json:"swift_code"`
	IBAN             string     `json:"iban"`
	Currency         string     `json:"currency"`
	AccountType      string     `json:"account_type"`
	CurrentBalance   float64    `json:"current_balance"`
	AvailableBalance float64    `json:"available_balance"`
	IsPrimary        bool       `json:"is_primary"`
	IsActive         bool       `json:"is_active"`
	LastReconciled   *time.Time `json:"last_reconciled"`
	Notes            string     `json:"notes"`
	CreatedAt        time.Time  `json:"created_at"`
}

// GetBankAccounts obtiene cuentas bancarias
func (r *AccountantRepository) GetBankAccounts(ctx context.Context) ([]*BankAccount, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, account_name, COALESCE(account_number, '') as account_number, bank_name,
			COALESCE(bank_code, '') as bank_code, COALESCE(swift_code, '') as swift, COALESCE(iban, '') as iban,
			currency, COALESCE(account_type, '') as account_type, current_balance, available_balance,
			is_primary, is_active, last_reconciled, COALESCE(notes, '') as notes, created_at
		FROM bank_accounts ORDER BY is_primary DESC, account_name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var accounts []*BankAccount
	for rows.Next() {
		a := &BankAccount{}
		if err := rows.Scan(&a.ID, &a.AccountName, &a.AccountNumber, &a.BankName, &a.BankCode, &a.SwiftCode,
			&a.IBAN, &a.Currency, &a.AccountType, &a.CurrentBalance, &a.AvailableBalance, &a.IsPrimary,
			&a.IsActive, &a.LastReconciled, &a.Notes, &a.CreatedAt); err != nil {
			return nil, err
		}
		accounts = append(accounts, a)
	}
	return accounts, nil
}

// ========== RECONCILIATIONS ==========

// Reconciliation conciliación
type Reconciliation struct {
	ID               int64      `json:"id"`
	ReconciliationDate time.Time `json:"reconciliation_date"`
	PeriodStart      *time.Time `json:"period_start"`
	PeriodEnd        *time.Time `json:"period_end"`
	ExpectedBalance  float64    `json:"expected_balance"`
	ActualBalance    float64    `json:"actual_balance"`
	Difference       float64    `json:"difference"`
	Status           string     `json:"status"`
	ReconciledBy     *int64     `json:"reconciled_by"`
	ReconciledByName *string    `json:"reconciled_by_name"`
	ReconciledAt     *time.Time `json:"reconciled_at"`
	ResolutionNotes  string     `json:"resolution_notes"`
	CreatedAt        time.Time  `json:"created_at"`
}

// GetReconciliations obtiene conciliaciones
func (r *AccountantRepository) GetReconciliations(ctx context.Context, status string, limit int) ([]*Reconciliation, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT r.id, r.reconciliation_date, r.period_start, r.period_end, r.expected_balance, r.actual_balance,
			r.difference, r.status, r.reconciled_by, 
			COALESCE(a.first_name || ' ' || a.last_name, NULL) as reconciled_by_name,
			r.reconciled_at, COALESCE(r.resolution_notes, '') as notes, r.created_at
		FROM reconciliations r
		LEFT JOIN users a ON r.reconciled_by = a.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND r.status = $%d", argNum)
		args = append(args, status)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY r.reconciliation_date DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reconciliations []*Reconciliation
	for rows.Next() {
		rec := &Reconciliation{}
		if err := rows.Scan(&rec.ID, &rec.ReconciliationDate, &rec.PeriodStart, &rec.PeriodEnd, &rec.ExpectedBalance,
			&rec.ActualBalance, &rec.Difference, &rec.Status, &rec.ReconciledBy, &rec.ReconciledByName,
			&rec.ReconciledAt, &rec.ResolutionNotes, &rec.CreatedAt); err != nil {
			return nil, err
		}
		reconciliations = append(reconciliations, rec)
	}
	return reconciliations, nil
}

// CreateReconciliation crea una conciliación
func (r *AccountantRepository) CreateReconciliation(ctx context.Context, rec *Reconciliation) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO reconciliations (reconciliation_date, period_start, period_end, expected_balance, actual_balance, difference, status)
		VALUES ($1, $2, $3, $4, $5, $6, 'pending')
		RETURNING id
	`, rec.ReconciliationDate, rec.PeriodStart, rec.PeriodEnd, rec.ExpectedBalance, rec.ActualBalance, rec.Difference).Scan(&id)
	return id, err
}

// ResolveReconciliation resuelve una conciliación
func (r *AccountantRepository) ResolveReconciliation(ctx context.Context, id, accountantID int64, notes string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE reconciliations SET status = 'resolved', reconciled_by = $1, reconciled_at = NOW(), resolution_notes = $2, updated_at = NOW()
		WHERE id = $3
	`, accountantID, notes, id)
	return err
}


// ========== FINANCIAL REPORTS ==========

// FinancialReport reporte financiero
type FinancialReport struct {
	ID                int64     `json:"id"`
	ReportType        string    `json:"report_type"`
	ReportName        string    `json:"report_name"`
	PeriodType        string    `json:"period_type"`
	PeriodStart       time.Time `json:"period_start"`
	PeriodEnd         time.Time `json:"period_end"`
	TotalDeposits     float64   `json:"total_deposits"`
	TotalWithdrawals  float64   `json:"total_withdrawals"`
	TotalCommissions  float64   `json:"total_commissions"`
	TotalPrizes       float64   `json:"total_prizes"`
	TotalBonuses      float64   `json:"total_bonuses"`
	NetRevenue        float64   `json:"net_revenue"`
	GrossProfit       float64   `json:"gross_profit"`
	OperatingExpenses float64   `json:"operating_expenses"`
	NetProfit         float64   `json:"net_profit"`
	PlatformBalance   float64   `json:"platform_balance"`
	ActiveUsers       int       `json:"active_users"`
	NewUsers          int       `json:"new_users"`
	GeneratedBy       *int64    `json:"generated_by"`
	GeneratedByName   *string   `json:"generated_by_name"`
	GeneratedAt       time.Time `json:"generated_at"`
	FilePath          string    `json:"file_path"`
	Notes             string    `json:"notes"`
}

// GetFinancialReports obtiene reportes financieros
func (r *AccountantRepository) GetFinancialReports(ctx context.Context, reportType, periodType string, limit int) ([]*FinancialReport, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT fr.id, fr.report_type, fr.report_name, fr.period_type, fr.period_start, fr.period_end,
			fr.total_deposits, fr.total_withdrawals, fr.total_commissions, fr.total_prizes, fr.total_bonuses,
			fr.net_revenue, fr.gross_profit, fr.operating_expenses, fr.net_profit, fr.platform_balance,
			fr.active_users, fr.new_users, fr.generated_by,
			COALESCE(a.first_name || ' ' || a.last_name, NULL) as generated_by_name,
			fr.generated_at, COALESCE(fr.file_path, '') as file_path, COALESCE(fr.notes, '') as notes
		FROM financial_reports fr
		LEFT JOIN users a ON fr.generated_by = a.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if reportType != "" && reportType != "all" {
		query += fmt.Sprintf(" AND fr.report_type = $%d", argNum)
		args = append(args, reportType)
		argNum++
	}
	if periodType != "" && periodType != "all" {
		query += fmt.Sprintf(" AND fr.period_type = $%d", argNum)
		args = append(args, periodType)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY fr.generated_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reports []*FinancialReport
	for rows.Next() {
		rep := &FinancialReport{}
		if err := rows.Scan(&rep.ID, &rep.ReportType, &rep.ReportName, &rep.PeriodType, &rep.PeriodStart, &rep.PeriodEnd,
			&rep.TotalDeposits, &rep.TotalWithdrawals, &rep.TotalCommissions, &rep.TotalPrizes, &rep.TotalBonuses,
			&rep.NetRevenue, &rep.GrossProfit, &rep.OperatingExpenses, &rep.NetProfit, &rep.PlatformBalance,
			&rep.ActiveUsers, &rep.NewUsers, &rep.GeneratedBy, &rep.GeneratedByName, &rep.GeneratedAt,
			&rep.FilePath, &rep.Notes); err != nil {
			return nil, err
		}
		reports = append(reports, rep)
	}
	return reports, nil
}

// GenerateFinancialReport genera un reporte financiero
func (r *AccountantRepository) GenerateFinancialReport(ctx context.Context, reportType, reportName, periodType string, periodStart, periodEnd time.Time, accountantID int64) (int64, error) {
	// Calcular totales
	var totalDeposits, totalWithdrawals, totalCommissions, totalPrizes, totalBonuses float64
	var activeUsers, newUsers int

	r.pool.QueryRow(ctx, "SELECT COALESCE(SUM(amount), 0) FROM deposit_requests WHERE status = 'confirmed' AND created_at BETWEEN $1 AND $2", periodStart, periodEnd).Scan(&totalDeposits)
	r.pool.QueryRow(ctx, "SELECT COALESCE(SUM(amount), 0) FROM withdrawal_requests WHERE status = 'approved' AND created_at BETWEEN $1 AND $2", periodStart, periodEnd).Scan(&totalWithdrawals)
	r.pool.QueryRow(ctx, "SELECT COALESCE(SUM(amount), 0) FROM commissions WHERE collected_at BETWEEN $1 AND $2", periodStart, periodEnd).Scan(&totalCommissions)
	r.pool.QueryRow(ctx, "SELECT COALESCE(SUM(prize_amount), 0) FROM tournament_prizes WHERE status = 'paid' AND paid_at BETWEEN $1 AND $2", periodStart, periodEnd).Scan(&totalPrizes)
	r.pool.QueryRow(ctx, "SELECT COUNT(DISTINCT user_id) FROM user_financial_transactions WHERE created_at BETWEEN $1 AND $2", periodStart, periodEnd).Scan(&activeUsers)
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM users WHERE created_at BETWEEN $1 AND $2", periodStart, periodEnd).Scan(&newUsers)

	netRevenue := totalDeposits - totalWithdrawals + totalCommissions
	grossProfit := netRevenue - totalPrizes - totalBonuses

	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO financial_reports (report_type, report_name, period_type, period_start, period_end, total_deposits, total_withdrawals, total_commissions, total_prizes, total_bonuses, net_revenue, gross_profit, active_users, new_users, generated_by, generated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
		RETURNING id
	`, reportType, reportName, periodType, periodStart, periodEnd, totalDeposits, totalWithdrawals, totalCommissions, totalPrizes, totalBonuses, netRevenue, grossProfit, activeUsers, newUsers, accountantID).Scan(&id)
	return id, err
}

// ========== DAILY/MONTHLY SUMMARIES ==========

// DailyFinancialSummary resumen financiero diario
type DailyFinancialSummary struct {
	ID                 int64     `json:"id"`
	SummaryDate        time.Time `json:"summary_date"`
	TotalDeposits      float64   `json:"total_deposits"`
	DepositCount       int       `json:"deposit_count"`
	TotalWithdrawals   float64   `json:"total_withdrawals"`
	WithdrawalCount    int       `json:"withdrawal_count"`
	PendingWithdrawals float64   `json:"pending_withdrawals"`
	PendingDeposits    float64   `json:"pending_deposits"`
	TotalCommissions   float64   `json:"total_commissions"`
	TotalPrizesPaid    float64   `json:"total_prizes_paid"`
	TotalBonusesGiven  float64   `json:"total_bonuses_given"`
	TradingVolume      float64   `json:"trading_volume"`
	PlatformBalance    float64   `json:"platform_balance"`
	ActiveUsers        int       `json:"active_users"`
	NewRegistrations   int       `json:"new_registrations"`
}

// GetDailySummaries obtiene resúmenes diarios
func (r *AccountantRepository) GetDailySummaries(ctx context.Context, startDate, endDate time.Time, limit int) ([]*DailyFinancialSummary, error) {
	if limit <= 0 {
		limit = 30
	}
	query := `
		SELECT id, summary_date, total_deposits, deposit_count, total_withdrawals, withdrawal_count,
			pending_withdrawals, pending_deposits, total_commissions, total_prizes_paid, total_bonuses_given,
			trading_volume, platform_balance, active_users, new_registrations
		FROM daily_financial_summaries
		WHERE summary_date BETWEEN $1 AND $2
		ORDER BY summary_date DESC LIMIT $3
	`
	rows, err := r.pool.Query(ctx, query, startDate, endDate, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var summaries []*DailyFinancialSummary
	for rows.Next() {
		s := &DailyFinancialSummary{}
		if err := rows.Scan(&s.ID, &s.SummaryDate, &s.TotalDeposits, &s.DepositCount, &s.TotalWithdrawals,
			&s.WithdrawalCount, &s.PendingWithdrawals, &s.PendingDeposits, &s.TotalCommissions, &s.TotalPrizesPaid,
			&s.TotalBonusesGiven, &s.TradingVolume, &s.PlatformBalance, &s.ActiveUsers, &s.NewRegistrations); err != nil {
			return nil, err
		}
		summaries = append(summaries, s)
	}
	return summaries, nil
}

// MonthlyFinancialSummary resumen financiero mensual
type MonthlyFinancialSummary struct {
	ID                 int64   `json:"id"`
	Year               int     `json:"year"`
	Month              int     `json:"month"`
	TotalDeposits      float64 `json:"total_deposits"`
	TotalWithdrawals   float64 `json:"total_withdrawals"`
	TotalCommissions   float64 `json:"total_commissions"`
	TotalPrizes        float64 `json:"total_prizes"`
	TotalBonuses       float64 `json:"total_bonuses"`
	OperatingExpenses  float64 `json:"operating_expenses"`
	NetRevenue         float64 `json:"net_revenue"`
	GrossProfit        float64 `json:"gross_profit"`
	NetProfit          float64 `json:"net_profit"`
	GrowthRate         float64 `json:"growth_rate"`
	UserRetentionRate  float64 `json:"user_retention_rate"`
	AverageUserBalance float64 `json:"average_user_balance"`
}

// GetMonthlySummaries obtiene resúmenes mensuales
func (r *AccountantRepository) GetMonthlySummaries(ctx context.Context, year int, limit int) ([]*MonthlyFinancialSummary, error) {
	if limit <= 0 {
		limit = 12
	}
	query := `
		SELECT id, year, month, total_deposits, total_withdrawals, total_commissions, total_prizes, total_bonuses,
			operating_expenses, net_revenue, gross_profit, net_profit, COALESCE(growth_rate, 0) as growth_rate,
			COALESCE(user_retention_rate, 0) as retention, COALESCE(average_user_balance, 0) as avg_balance
		FROM monthly_financial_summaries
		WHERE year = $1
		ORDER BY month DESC LIMIT $2
	`
	rows, err := r.pool.Query(ctx, query, year, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var summaries []*MonthlyFinancialSummary
	for rows.Next() {
		s := &MonthlyFinancialSummary{}
		if err := rows.Scan(&s.ID, &s.Year, &s.Month, &s.TotalDeposits, &s.TotalWithdrawals, &s.TotalCommissions,
			&s.TotalPrizes, &s.TotalBonuses, &s.OperatingExpenses, &s.NetRevenue, &s.GrossProfit, &s.NetProfit,
			&s.GrowthRate, &s.UserRetentionRate, &s.AverageUserBalance); err != nil {
			return nil, err
		}
		summaries = append(summaries, s)
	}
	return summaries, nil
}

// ========== AUDIT LOGS ==========

// AuditLog log de auditoría
type AuditLog struct {
	ID            int64      `json:"id"`
	AccountantID  *int64     `json:"accountant_id"`
	AccountantName *string   `json:"accountant_name"`
	UserID        *int64     `json:"user_id"`
	UserName      *string    `json:"user_name"`
	Action        string     `json:"action"`
	ActionType    string     `json:"action_type"`
	EntityType    string     `json:"entity_type"`
	EntityID      *int64     `json:"entity_id"`
	Details       string     `json:"details"`
	Amount        *float64   `json:"amount"`
	IPAddress     string     `json:"ip_address"`
	RiskLevel     string     `json:"risk_level"`
	Reviewed      bool       `json:"reviewed"`
	ReviewedBy    *int64     `json:"reviewed_by"`
	ReviewedAt    *time.Time `json:"reviewed_at"`
	CreatedAt     time.Time  `json:"created_at"`
}

// GetAuditLogs obtiene logs de auditoría
func (r *AccountantRepository) GetAuditLogs(ctx context.Context, actionType, riskLevel string, limit int) ([]*AuditLog, error) {
	if limit <= 0 {
		limit = 100
	}
	query := `
		SELECT al.id, al.accountant_id, COALESCE(a.first_name || ' ' || a.last_name, NULL) as accountant_name,
			al.user_id, COALESCE(u.first_name || ' ' || u.last_name, NULL) as user_name,
			al.action, al.action_type, COALESCE(al.entity_type, '') as entity_type, al.entity_id,
			COALESCE(al.details, '') as details, al.amount, COALESCE(al.ip_address::text, '') as ip,
			al.risk_level, al.reviewed, al.reviewed_by, al.reviewed_at, al.created_at
		FROM audit_logs al
		LEFT JOIN users a ON al.accountant_id = a.id
		LEFT JOIN users u ON al.user_id = u.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if actionType != "" && actionType != "all" {
		query += fmt.Sprintf(" AND al.action_type = $%d", argNum)
		args = append(args, actionType)
		argNum++
	}
	if riskLevel != "" && riskLevel != "all" {
		query += fmt.Sprintf(" AND al.risk_level = $%d", argNum)
		args = append(args, riskLevel)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY al.created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []*AuditLog
	for rows.Next() {
		l := &AuditLog{}
		if err := rows.Scan(&l.ID, &l.AccountantID, &l.AccountantName, &l.UserID, &l.UserName, &l.Action,
			&l.ActionType, &l.EntityType, &l.EntityID, &l.Details, &l.Amount, &l.IPAddress, &l.RiskLevel,
			&l.Reviewed, &l.ReviewedBy, &l.ReviewedAt, &l.CreatedAt); err != nil {
			return nil, err
		}
		logs = append(logs, l)
	}
	return logs, nil
}

// CreateAuditLog crea un log de auditoría
func (r *AccountantRepository) CreateAuditLog(ctx context.Context, accountantID, userID *int64, action, actionType, entityType string, entityID *int64, details string, amount *float64, ipAddress string) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO audit_logs (accountant_id, user_id, action, action_type, entity_type, entity_id, details, amount, ip_address)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::inet)
	`, accountantID, userID, action, actionType, entityType, entityID, details, amount, ipAddress)
	return err
}


// ========== SUSPICIOUS ALERTS ==========

// SuspiciousAlert alerta sospechosa
type SuspiciousAlert struct {
	ID                     int64      `json:"id"`
	UserID                 int64      `json:"user_id"`
	UserName               string     `json:"user_name"`
	UserEmail              string     `json:"user_email"`
	AlertType              string     `json:"alert_type"`
	Severity               string     `json:"severity"`
	Amount                 *float64   `json:"amount"`
	Reason                 string     `json:"reason"`
	RelatedTransactionID   *int64     `json:"related_transaction_id"`
	RelatedTransactionType string     `json:"related_transaction_type"`
	Status                 string     `json:"status"`
	Reviewed               bool       `json:"reviewed"`
	ReviewedBy             *int64     `json:"reviewed_by"`
	ReviewedByName         *string    `json:"reviewed_by_name"`
	ReviewedAt             *time.Time `json:"reviewed_at"`
	ReviewNotes            string     `json:"review_notes"`
	ActionTaken            string     `json:"action_taken"`
	Escalated              bool       `json:"escalated"`
	EscalatedTo            *int64     `json:"escalated_to"`
	EscalatedAt            *time.Time `json:"escalated_at"`
	CreatedAt              time.Time  `json:"created_at"`
}

// GetSuspiciousAlerts obtiene alertas sospechosas
func (r *AccountantRepository) GetSuspiciousAlerts(ctx context.Context, status, severity string, limit int) ([]*SuspiciousAlert, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT sa.id, sa.user_id, COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			COALESCE(u.email, '') as user_email, sa.alert_type, sa.severity, sa.amount, sa.reason,
			sa.related_transaction_id, COALESCE(sa.related_transaction_type, '') as tx_type, sa.status,
			sa.reviewed, sa.reviewed_by, COALESCE(a.first_name || ' ' || a.last_name, NULL) as reviewed_by_name,
			sa.reviewed_at, COALESCE(sa.review_notes, '') as review_notes, COALESCE(sa.action_taken, '') as action,
			sa.escalated, sa.escalated_to, sa.escalated_at, sa.created_at
		FROM suspicious_alerts sa
		LEFT JOIN users u ON sa.user_id = u.id
		LEFT JOIN users a ON sa.reviewed_by = a.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND sa.status = $%d", argNum)
		args = append(args, status)
		argNum++
	}
	if severity != "" && severity != "all" {
		query += fmt.Sprintf(" AND sa.severity = $%d", argNum)
		args = append(args, severity)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY sa.created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var alerts []*SuspiciousAlert
	for rows.Next() {
		a := &SuspiciousAlert{}
		if err := rows.Scan(&a.ID, &a.UserID, &a.UserName, &a.UserEmail, &a.AlertType, &a.Severity, &a.Amount,
			&a.Reason, &a.RelatedTransactionID, &a.RelatedTransactionType, &a.Status, &a.Reviewed, &a.ReviewedBy,
			&a.ReviewedByName, &a.ReviewedAt, &a.ReviewNotes, &a.ActionTaken, &a.Escalated, &a.EscalatedTo,
			&a.EscalatedAt, &a.CreatedAt); err != nil {
			return nil, err
		}
		alerts = append(alerts, a)
	}
	return alerts, nil
}

// ReviewAlert revisa una alerta
func (r *AccountantRepository) ReviewAlert(ctx context.Context, id, accountantID int64, notes, actionTaken string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE suspicious_alerts SET status = 'reviewed', reviewed = true, reviewed_by = $1, reviewed_at = NOW(), review_notes = $2, action_taken = $3
		WHERE id = $4
	`, accountantID, notes, actionTaken, id)
	return err
}

// EscalateAlert escala una alerta
func (r *AccountantRepository) EscalateAlert(ctx context.Context, id int64, escalateTo int64) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE suspicious_alerts SET escalated = true, escalated_to = $1, escalated_at = NOW(), status = 'escalated'
		WHERE id = $2
	`, escalateTo, id)
	return err
}

// ========== FRAUD INVESTIGATIONS ==========

// FraudInvestigation investigación de fraude
type FraudInvestigation struct {
	ID                int64      `json:"id"`
	CaseNumber        string     `json:"case_number"`
	UserID            int64      `json:"user_id"`
	UserName          string     `json:"user_name"`
	UserEmail         string     `json:"user_email"`
	InvestigationType string     `json:"investigation_type"`
	Status            string     `json:"status"`
	Priority          string     `json:"priority"`
	AssignedTo        *int64     `json:"assigned_to"`
	AssignedToName    *string    `json:"assigned_to_name"`
	Findings          string     `json:"findings"`
	Conclusion        string     `json:"conclusion"`
	ActionTaken       string     `json:"action_taken"`
	AmountInvolved    *float64   `json:"amount_involved"`
	OpenedAt          time.Time  `json:"opened_at"`
	ClosedAt          *time.Time `json:"closed_at"`
	ClosedBy          *int64     `json:"closed_by"`
}

// GetFraudInvestigations obtiene investigaciones de fraude
func (r *AccountantRepository) GetFraudInvestigations(ctx context.Context, status, priority string, limit int) ([]*FraudInvestigation, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT fi.id, fi.case_number, fi.user_id, COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			COALESCE(u.email, '') as user_email, COALESCE(fi.investigation_type, '') as inv_type, fi.status, fi.priority,
			fi.assigned_to, COALESCE(a.first_name || ' ' || a.last_name, NULL) as assigned_to_name,
			COALESCE(fi.findings, '') as findings, COALESCE(fi.conclusion, '') as conclusion,
			COALESCE(fi.action_taken, '') as action, fi.amount_involved, fi.opened_at, fi.closed_at, fi.closed_by
		FROM fraud_investigations fi
		LEFT JOIN users u ON fi.user_id = u.id
		LEFT JOIN users a ON fi.assigned_to = a.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND fi.status = $%d", argNum)
		args = append(args, status)
		argNum++
	}
	if priority != "" && priority != "all" {
		query += fmt.Sprintf(" AND fi.priority = $%d", argNum)
		args = append(args, priority)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY fi.opened_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var investigations []*FraudInvestigation
	for rows.Next() {
		inv := &FraudInvestigation{}
		if err := rows.Scan(&inv.ID, &inv.CaseNumber, &inv.UserID, &inv.UserName, &inv.UserEmail, &inv.InvestigationType,
			&inv.Status, &inv.Priority, &inv.AssignedTo, &inv.AssignedToName, &inv.Findings, &inv.Conclusion,
			&inv.ActionTaken, &inv.AmountInvolved, &inv.OpenedAt, &inv.ClosedAt, &inv.ClosedBy); err != nil {
			return nil, err
		}
		investigations = append(investigations, inv)
	}
	return investigations, nil
}

// CreateFraudInvestigation crea una investigación de fraude
func (r *AccountantRepository) CreateFraudInvestigation(ctx context.Context, userID int64, caseNumber, investigationType, priority string, assignedTo int64) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO fraud_investigations (case_number, user_id, investigation_type, status, priority, assigned_to, opened_at)
		VALUES ($1, $2, $3, 'open', $4, $5, NOW())
		RETURNING id
	`, caseNumber, userID, investigationType, priority, assignedTo).Scan(&id)
	return id, err
}

// CloseFraudInvestigation cierra una investigación
func (r *AccountantRepository) CloseFraudInvestigation(ctx context.Context, id, accountantID int64, findings, conclusion, actionTaken string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE fraud_investigations SET status = 'closed', findings = $1, conclusion = $2, action_taken = $3, closed_at = NOW(), closed_by = $4
		WHERE id = $5
	`, findings, conclusion, actionTaken, accountantID, id)
	return err
}

// ========== ACCOUNTANT SETTINGS ==========

// AccountantSettings configuración del contador
type AccountantSettings struct {
	ID               int64  `json:"id"`
	AccountantID     int64  `json:"accountant_id"`
	Timezone         string `json:"timezone"`
	Language         string `json:"language"`
	DateFormat       string `json:"date_format"`
	CurrencyFormat   string `json:"currency_format"`
	Theme            string `json:"theme"`
	SidebarCollapsed bool   `json:"sidebar_collapsed"`
	DefaultView      string `json:"default_view"`
	ItemsPerPage     int    `json:"items_per_page"`
}

// GetAccountantSettings obtiene configuración del contador
func (r *AccountantRepository) GetAccountantSettings(ctx context.Context, accountantID int64) (*AccountantSettings, error) {
	s := &AccountantSettings{}
	err := r.pool.QueryRow(ctx, `
		SELECT id, accountant_id, timezone, language, date_format, currency_format, theme, sidebar_collapsed, default_view, items_per_page
		FROM accountant_settings WHERE accountant_id = $1
	`, accountantID).Scan(&s.ID, &s.AccountantID, &s.Timezone, &s.Language, &s.DateFormat, &s.CurrencyFormat, &s.Theme, &s.SidebarCollapsed, &s.DefaultView, &s.ItemsPerPage)
	if err != nil {
		// Crear configuración por defecto
		r.pool.Exec(ctx, `
			INSERT INTO accountant_settings (accountant_id, timezone, language, date_format, currency_format, theme, default_view, items_per_page)
			VALUES ($1, 'Europe/Madrid', 'es', 'DD/MM/YYYY', 'USD', 'dark', 'dashboard', 25)
			ON CONFLICT (accountant_id) DO NOTHING
		`, accountantID)
		return &AccountantSettings{
			AccountantID:   accountantID,
			Timezone:       "Europe/Madrid",
			Language:       "es",
			DateFormat:     "DD/MM/YYYY",
			CurrencyFormat: "USD",
			Theme:          "dark",
			DefaultView:    "dashboard",
			ItemsPerPage:   25,
		}, nil
	}
	return s, nil
}

// UpdateAccountantSettings actualiza configuración
func (r *AccountantRepository) UpdateAccountantSettings(ctx context.Context, accountantID int64, settings *AccountantSettings) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO accountant_settings (accountant_id, timezone, language, date_format, currency_format, theme, sidebar_collapsed, default_view, items_per_page)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (accountant_id) DO UPDATE SET
			timezone = EXCLUDED.timezone, language = EXCLUDED.language, date_format = EXCLUDED.date_format,
			currency_format = EXCLUDED.currency_format, theme = EXCLUDED.theme, sidebar_collapsed = EXCLUDED.sidebar_collapsed,
			default_view = EXCLUDED.default_view, items_per_page = EXCLUDED.items_per_page, updated_at = NOW()
	`, accountantID, settings.Timezone, settings.Language, settings.DateFormat, settings.CurrencyFormat, settings.Theme, settings.SidebarCollapsed, settings.DefaultView, settings.ItemsPerPage)
	return err
}

// ========== ACCOUNTANT NOTIFICATIONS ==========

// AccountantNotification notificación del contador
type AccountantNotification struct {
	ID                int64      `json:"id"`
	AccountantID      int64      `json:"accountant_id"`
	NotificationType  string     `json:"notification_type"`
	Title             string     `json:"title"`
	Message           string     `json:"message"`
	Priority          string     `json:"priority"`
	RelatedEntityType string     `json:"related_entity_type"`
	RelatedEntityID   *int64     `json:"related_entity_id"`
	ActionURL         string     `json:"action_url"`
	IsRead            bool       `json:"is_read"`
	ReadAt            *time.Time `json:"read_at"`
	IsArchived        bool       `json:"is_archived"`
	CreatedAt         time.Time  `json:"created_at"`
}

// GetAccountantNotifications obtiene notificaciones
func (r *AccountantRepository) GetAccountantNotifications(ctx context.Context, accountantID int64, unreadOnly bool, limit int) ([]*AccountantNotification, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT id, accountant_id, notification_type, title, COALESCE(message, '') as message, priority,
			COALESCE(related_entity_type, '') as entity_type, related_entity_id, COALESCE(action_url, '') as action_url,
			is_read, read_at, is_archived, created_at
		FROM accountant_notifications
		WHERE accountant_id = $1 AND is_archived = false
	`
	args := []interface{}{accountantID}
	argNum := 2
	if unreadOnly {
		query += " AND is_read = false"
	}
	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []*AccountantNotification
	for rows.Next() {
		n := &AccountantNotification{}
		if err := rows.Scan(&n.ID, &n.AccountantID, &n.NotificationType, &n.Title, &n.Message, &n.Priority,
			&n.RelatedEntityType, &n.RelatedEntityID, &n.ActionURL, &n.IsRead, &n.ReadAt, &n.IsArchived, &n.CreatedAt); err != nil {
			return nil, err
		}
		notifications = append(notifications, n)
	}
	return notifications, nil
}

// MarkNotificationRead marca notificación como leída
func (r *AccountantRepository) MarkAccountantNotificationRead(ctx context.Context, id, accountantID int64) error {
	_, err := r.pool.Exec(ctx, `UPDATE accountant_notifications SET is_read = true, read_at = NOW() WHERE id = $1 AND accountant_id = $2`, id, accountantID)
	return err
}

// GetUnreadNotificationCount obtiene conteo de no leídas
func (r *AccountantRepository) GetUnreadNotificationCount(ctx context.Context, accountantID int64) (int, error) {
	var count int
	err := r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM accountant_notifications WHERE accountant_id = $1 AND is_read = false AND is_archived = false`, accountantID).Scan(&count)
	return count, err
}


// ========== PLATFORM METRICS ==========

// PlatformMetrics métricas de plataforma
type PlatformMetrics struct {
	ID                  int64     `json:"id"`
	MetricDate          time.Time `json:"metric_date"`
	MetricHour          *int      `json:"metric_hour"`
	TotalBalance        float64   `json:"total_balance"`
	TotalDeposits24h    float64   `json:"total_deposits_24h"`
	TotalWithdrawals24h float64   `json:"total_withdrawals_24h"`
	PendingWithdrawals  float64   `json:"pending_withdrawals"`
	PendingDeposits     float64   `json:"pending_deposits"`
	ActiveUsers24h      int       `json:"active_users_24h"`
	TradingVolume24h    float64   `json:"trading_volume_24h"`
	TotalCommissions24h float64   `json:"total_commissions_24h"`
}

// GetPlatformMetrics obtiene métricas de plataforma
func (r *AccountantRepository) GetPlatformMetrics(ctx context.Context, startDate, endDate time.Time) ([]*PlatformMetrics, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, metric_date, metric_hour, total_balance, total_deposits_24h, total_withdrawals_24h,
			pending_withdrawals, pending_deposits, active_users_24h, trading_volume_24h, total_commissions_24h
		FROM platform_metrics
		WHERE metric_date BETWEEN $1 AND $2
		ORDER BY metric_date DESC, metric_hour DESC
	`, startDate, endDate)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var metrics []*PlatformMetrics
	for rows.Next() {
		m := &PlatformMetrics{}
		if err := rows.Scan(&m.ID, &m.MetricDate, &m.MetricHour, &m.TotalBalance, &m.TotalDeposits24h,
			&m.TotalWithdrawals24h, &m.PendingWithdrawals, &m.PendingDeposits, &m.ActiveUsers24h,
			&m.TradingVolume24h, &m.TotalCommissions24h); err != nil {
			return nil, err
		}
		metrics = append(metrics, m)
	}
	return metrics, nil
}

// ========== EXPENSE CATEGORIES ==========

// ExpenseCategory categoría de gasto
type ExpenseCategory struct {
	ID            int64   `json:"id"`
	Name          string  `json:"name"`
	Code          string  `json:"code"`
	ParentID      *int64  `json:"parent_id"`
	Description   string  `json:"description"`
	BudgetMonthly float64 `json:"budget_monthly"`
	IsActive      bool    `json:"is_active"`
}

// GetExpenseCategories obtiene categorías de gastos
func (r *AccountantRepository) GetExpenseCategories(ctx context.Context) ([]*ExpenseCategory, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, name, code, parent_id, COALESCE(description, '') as description, COALESCE(budget_monthly, 0) as budget, is_active
		FROM expense_categories ORDER BY name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []*ExpenseCategory
	for rows.Next() {
		c := &ExpenseCategory{}
		if err := rows.Scan(&c.ID, &c.Name, &c.Code, &c.ParentID, &c.Description, &c.BudgetMonthly, &c.IsActive); err != nil {
			return nil, err
		}
		categories = append(categories, c)
	}
	return categories, nil
}

// ========== OPERATING EXPENSES ==========

// OperatingExpense gasto operativo
type OperatingExpense struct {
	ID               int64      `json:"id"`
	ExpenseCategory  string     `json:"expense_category"`
	ExpenseType      string     `json:"expense_type"`
	Description      string     `json:"description"`
	Amount           float64    `json:"amount"`
	Currency         string     `json:"currency"`
	ExpenseDate      time.Time  `json:"expense_date"`
	VendorID         *int64     `json:"vendor_id"`
	VendorName       *string    `json:"vendor_name"`
	InvoiceID        *int64     `json:"invoice_id"`
	PaymentMethod    string     `json:"payment_method"`
	PaymentReference string     `json:"payment_reference"`
	IsRecurring      bool       `json:"is_recurring"`
	RecurrencePeriod string     `json:"recurrence_period"`
	ApprovedBy       *int64     `json:"approved_by"`
	ApprovedByName   *string    `json:"approved_by_name"`
	ApprovedAt       *time.Time `json:"approved_at"`
	Status           string     `json:"status"`
	Notes            string     `json:"notes"`
	CreatedBy        int64      `json:"created_by"`
	CreatedAt        time.Time  `json:"created_at"`
}

// GetOperatingExpenses obtiene gastos operativos
func (r *AccountantRepository) GetOperatingExpenses(ctx context.Context, category, status string, limit int) ([]*OperatingExpense, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT oe.id, oe.expense_category, oe.expense_type, COALESCE(oe.description, '') as description,
			oe.amount, oe.currency, oe.expense_date, oe.vendor_id, 
			COALESCE(v.name, NULL) as vendor_name, oe.invoice_id,
			COALESCE(oe.payment_method, '') as payment_method, COALESCE(oe.payment_reference, '') as payment_ref,
			oe.is_recurring, COALESCE(oe.recurrence_period, '') as recurrence, oe.approved_by,
			COALESCE(a.first_name || ' ' || a.last_name, NULL) as approved_by_name, oe.approved_at,
			oe.status, COALESCE(oe.notes, '') as notes, COALESCE(oe.created_by, 0) as created_by, oe.created_at
		FROM operating_expenses oe
		LEFT JOIN vendors v ON oe.vendor_id = v.id
		LEFT JOIN users a ON oe.approved_by = a.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if category != "" && category != "all" {
		query += fmt.Sprintf(" AND oe.expense_category = $%d", argNum)
		args = append(args, category)
		argNum++
	}
	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND oe.status = $%d", argNum)
		args = append(args, status)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY oe.expense_date DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var expenses []*OperatingExpense
	for rows.Next() {
		e := &OperatingExpense{}
		if err := rows.Scan(&e.ID, &e.ExpenseCategory, &e.ExpenseType, &e.Description, &e.Amount, &e.Currency,
			&e.ExpenseDate, &e.VendorID, &e.VendorName, &e.InvoiceID, &e.PaymentMethod, &e.PaymentReference,
			&e.IsRecurring, &e.RecurrencePeriod, &e.ApprovedBy, &e.ApprovedByName, &e.ApprovedAt, &e.Status,
			&e.Notes, &e.CreatedBy, &e.CreatedAt); err != nil {
			return nil, err
		}
		expenses = append(expenses, e)
	}
	return expenses, nil
}

// CreateOperatingExpense crea un gasto operativo
func (r *AccountantRepository) CreateOperatingExpense(ctx context.Context, e *OperatingExpense) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operating_expenses (expense_category, expense_type, description, amount, currency, expense_date, vendor_id, payment_method, payment_reference, is_recurring, recurrence_period, status, notes, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', $12, $13)
		RETURNING id
	`, e.ExpenseCategory, e.ExpenseType, e.Description, e.Amount, e.Currency, e.ExpenseDate, e.VendorID, e.PaymentMethod, e.PaymentReference, e.IsRecurring, e.RecurrencePeriod, e.Notes, e.CreatedBy).Scan(&id)
	return id, err
}

// ApproveExpense aprueba un gasto
func (r *AccountantRepository) ApproveExpense(ctx context.Context, id, accountantID int64) error {
	_, err := r.pool.Exec(ctx, `UPDATE operating_expenses SET status = 'approved', approved_by = $1, approved_at = NOW() WHERE id = $2`, accountantID, id)
	return err
}

// ========== PAYMENT PROVIDERS ==========

// PaymentProvider proveedor de pago
type PaymentProvider struct {
	ID                  int64      `json:"id"`
	Name                string     `json:"name"`
	Code                string     `json:"code"`
	ProviderType        string     `json:"provider_type"`
	SupportedCurrencies []string   `json:"supported_currencies"`
	SupportedNetworks   []string   `json:"supported_networks"`
	MinTransaction      float64    `json:"min_transaction"`
	MaxTransaction      float64    `json:"max_transaction"`
	DailyLimit          float64    `json:"daily_limit"`
	IsActive            bool       `json:"is_active"`
	Status              string     `json:"status"`
	LastHealthCheck     *time.Time `json:"last_health_check"`
	CreatedAt           time.Time  `json:"created_at"`
}

// GetPaymentProviders obtiene proveedores de pago
func (r *AccountantRepository) GetPaymentProviders(ctx context.Context) ([]*PaymentProvider, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, name, code, provider_type, COALESCE(supported_currencies, '{}') as currencies,
			COALESCE(supported_networks, '{}') as networks, COALESCE(min_transaction, 0) as min_tx,
			COALESCE(max_transaction, 0) as max_tx, COALESCE(daily_limit, 0) as daily_limit,
			is_active, status, last_health_check, created_at
		FROM payment_providers ORDER BY name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var providers []*PaymentProvider
	for rows.Next() {
		p := &PaymentProvider{}
		if err := rows.Scan(&p.ID, &p.Name, &p.Code, &p.ProviderType, &p.SupportedCurrencies, &p.SupportedNetworks,
			&p.MinTransaction, &p.MaxTransaction, &p.DailyLimit, &p.IsActive, &p.Status, &p.LastHealthCheck, &p.CreatedAt); err != nil {
			return nil, err
		}
		providers = append(providers, p)
	}
	return providers, nil
}

// ========== ACCOUNTANT TASKS ==========

// AccountantTask tarea del contador
type AccountantTask struct {
	ID                int64      `json:"id"`
	AccountantID      int64      `json:"accountant_id"`
	TaskType          string     `json:"task_type"`
	Title             string     `json:"title"`
	Description       string     `json:"description"`
	Priority          string     `json:"priority"`
	Status            string     `json:"status"`
	DueDate           *time.Time `json:"due_date"`
	RelatedEntityType string     `json:"related_entity_type"`
	RelatedEntityID   *int64     `json:"related_entity_id"`
	AssignedBy        *int64     `json:"assigned_by"`
	AssignedByName    *string    `json:"assigned_by_name"`
	CompletedAt       *time.Time `json:"completed_at"`
	Notes             string     `json:"notes"`
	CreatedAt         time.Time  `json:"created_at"`
}

// GetAccountantTasks obtiene tareas del contador
func (r *AccountantRepository) GetAccountantTasks(ctx context.Context, accountantID int64, status string, limit int) ([]*AccountantTask, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT t.id, t.accountant_id, t.task_type, t.title, COALESCE(t.description, '') as description,
			t.priority, t.status, t.due_date, COALESCE(t.related_entity_type, '') as entity_type, t.related_entity_id,
			t.assigned_by, COALESCE(a.first_name || ' ' || a.last_name, NULL) as assigned_by_name,
			t.completed_at, COALESCE(t.notes, '') as notes, t.created_at
		FROM accountant_tasks t
		LEFT JOIN users a ON t.assigned_by = a.id
		WHERE t.accountant_id = $1
	`
	args := []interface{}{accountantID}
	argNum := 2
	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND t.status = $%d", argNum)
		args = append(args, status)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []*AccountantTask
	for rows.Next() {
		t := &AccountantTask{}
		if err := rows.Scan(&t.ID, &t.AccountantID, &t.TaskType, &t.Title, &t.Description, &t.Priority, &t.Status,
			&t.DueDate, &t.RelatedEntityType, &t.RelatedEntityID, &t.AssignedBy, &t.AssignedByName,
			&t.CompletedAt, &t.Notes, &t.CreatedAt); err != nil {
			return nil, err
		}
		tasks = append(tasks, t)
	}
	return tasks, nil
}

// CreateAccountantTask crea una tarea
func (r *AccountantRepository) CreateAccountantTask(ctx context.Context, t *AccountantTask) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO accountant_tasks (accountant_id, task_type, title, description, priority, status, due_date, related_entity_type, related_entity_id, assigned_by, notes)
		VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, $8, $9, $10)
		RETURNING id
	`, t.AccountantID, t.TaskType, t.Title, t.Description, t.Priority, t.DueDate, t.RelatedEntityType, t.RelatedEntityID, t.AssignedBy, t.Notes).Scan(&id)
	return id, err
}

// CompleteTask completa una tarea
func (r *AccountantRepository) CompleteTask(ctx context.Context, id, accountantID int64) error {
	_, err := r.pool.Exec(ctx, `UPDATE accountant_tasks SET status = 'completed', completed_at = NOW(), updated_at = NOW() WHERE id = $1 AND accountant_id = $2`, id, accountantID)
	return err
}

// ========== CASH FLOW ==========

// CashFlowRecord registro de flujo de caja
type CashFlowRecord struct {
	ID             int64     `json:"id"`
	RecordDate     time.Time `json:"record_date"`
	RecordType     string    `json:"record_type"`
	Category       string    `json:"category"`
	Description    string    `json:"description"`
	Inflow         float64   `json:"inflow"`
	Outflow        float64   `json:"outflow"`
	NetFlow        float64   `json:"net_flow"`
	RunningBalance float64   `json:"running_balance"`
	ReferenceType  string    `json:"reference_type"`
	ReferenceID    *int64    `json:"reference_id"`
	RecordedBy     *int64    `json:"recorded_by"`
	CreatedAt      time.Time `json:"created_at"`
}

// GetCashFlowRecords obtiene registros de flujo de caja
func (r *AccountantRepository) GetCashFlowRecords(ctx context.Context, startDate, endDate time.Time, limit int) ([]*CashFlowRecord, error) {
	if limit <= 0 {
		limit = 100
	}
	rows, err := r.pool.Query(ctx, `
		SELECT id, record_date, record_type, COALESCE(category, '') as category, COALESCE(description, '') as description,
			inflow, outflow, net_flow, COALESCE(running_balance, 0) as running_balance,
			COALESCE(reference_type, '') as ref_type, reference_id, recorded_by, created_at
		FROM cash_flow_records
		WHERE record_date BETWEEN $1 AND $2
		ORDER BY record_date DESC, created_at DESC LIMIT $3
	`, startDate, endDate, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []*CashFlowRecord
	for rows.Next() {
		rec := &CashFlowRecord{}
		if err := rows.Scan(&rec.ID, &rec.RecordDate, &rec.RecordType, &rec.Category, &rec.Description,
			&rec.Inflow, &rec.Outflow, &rec.NetFlow, &rec.RunningBalance, &rec.ReferenceType,
			&rec.ReferenceID, &rec.RecordedBy, &rec.CreatedAt); err != nil {
			return nil, err
		}
		records = append(records, rec)
	}
	return records, nil
}

// ========== DATA EXPORTS ==========

// AccountantDataExport exportación de datos del contador
type AccountantDataExport struct {
	ID             int64      `json:"id"`
	ExportType     string     `json:"export_type"`
	ExportFormat   string     `json:"export_format"`
	FileName       string     `json:"file_name"`
	FilePath       string     `json:"file_path"`
	FileSize       int        `json:"file_size"`
	DateRangeStart *time.Time `json:"date_range_start"`
	DateRangeEnd   *time.Time `json:"date_range_end"`
	RecordCount    int        `json:"record_count"`
	ExportedBy     int64      `json:"exported_by"`
	ExportedByName string     `json:"exported_by_name"`
	ExportedAt     time.Time  `json:"exported_at"`
	DownloadCount  int        `json:"download_count"`
	ExpiresAt      *time.Time `json:"expires_at"`
}

// GetDataExports obtiene exportaciones de datos
func (r *AccountantRepository) GetDataExports(ctx context.Context, accountantID int64, limit int) ([]*AccountantDataExport, error) {
	if limit <= 0 {
		limit = 50
	}
	rows, err := r.pool.Query(ctx, `
		SELECT de.id, de.export_type, de.export_format, de.file_name, COALESCE(de.file_path, '') as file_path,
			COALESCE(de.file_size, 0) as file_size, de.date_range_start, de.date_range_end,
			COALESCE(de.record_count, 0) as record_count, de.exported_by,
			COALESCE(a.first_name || ' ' || a.last_name, 'Sistema') as exported_by_name,
			de.exported_at, de.download_count, de.expires_at
		FROM data_exports de
		LEFT JOIN users a ON de.exported_by = a.id
		WHERE de.exported_by = $1
		ORDER BY de.exported_at DESC LIMIT $2
	`, accountantID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var exports []*AccountantDataExport
	for rows.Next() {
		e := &AccountantDataExport{}
		if err := rows.Scan(&e.ID, &e.ExportType, &e.ExportFormat, &e.FileName, &e.FilePath, &e.FileSize,
			&e.DateRangeStart, &e.DateRangeEnd, &e.RecordCount, &e.ExportedBy, &e.ExportedByName,
			&e.ExportedAt, &e.DownloadCount, &e.ExpiresAt); err != nil {
			return nil, err
		}
		exports = append(exports, e)
	}
	return exports, nil
}

// CreateDataExport crea una exportación
func (r *AccountantRepository) CreateDataExport(ctx context.Context, exportType, exportFormat, fileName string, dateStart, dateEnd *time.Time, accountantID int64) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO data_exports (export_type, export_format, file_name, date_range_start, date_range_end, exported_by, exported_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())
		RETURNING id
	`, exportType, exportFormat, fileName, dateStart, dateEnd, accountantID).Scan(&id)
	return id, err
}
