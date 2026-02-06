package models

import "time"

// WalletType tipo de billetera
type WalletType string

const (
	WalletLive  WalletType = "live"
	WalletDemo  WalletType = "demo"
	WalletBonus WalletType = "bonus"
)

// Wallet representa una billetera del usuario
type Wallet struct {
	ID        int64      `json:"id"`
	UserID    int64      `json:"user_id"`
	Type      WalletType `json:"type"`
	Balance   float64    `json:"balance"`
	Currency  string     `json:"currency"`
	IsActive  bool       `json:"is_active"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

// TransactionType tipo de transacción
type TransactionType string

const (
	TxDeposit      TransactionType = "deposit"
	TxWithdrawal   TransactionType = "withdrawal"
	TxBonus        TransactionType = "bonus"
	TxTradeProfit  TransactionType = "trade_profit"
	TxTradeLoss    TransactionType = "trade_loss"
	TxRefund       TransactionType = "refund"
	TxTransfer     TransactionType = "transfer"
)

// TransactionStatus estado de la transacción
type TransactionStatus string

const (
	TxPending   TransactionStatus = "pending"
	TxCompleted TransactionStatus = "completed"
	TxFailed    TransactionStatus = "failed"
	TxCancelled TransactionStatus = "cancelled"
)

// Transaction representa una transacción
type Transaction struct {
	ID          int64             `json:"id"`
	UserID      int64             `json:"user_id"`
	WalletID    *int64            `json:"wallet_id"`
	Type        TransactionType   `json:"type"`
	Amount      float64           `json:"amount"`
	Currency    string            `json:"currency"`
	Status      TransactionStatus `json:"status"`
	TxHash      *string           `json:"tx_hash"`
	Address     *string           `json:"address"`
	Network     *string           `json:"network"`
	Fee         float64           `json:"fee"`
	Notes       *string           `json:"notes"`
	ProcessedBy *int64            `json:"processed_by"`
	ProcessedAt *time.Time        `json:"processed_at"`
	CreatedAt   time.Time         `json:"created_at"`
}

// WithdrawalRequest solicitud de retiro
type WithdrawalRequest struct {
	ID              int64             `json:"id"`
	UserID          int64             `json:"user_id"`
	WalletID        *int64            `json:"wallet_id"`
	Amount          float64           `json:"amount"`
	Currency        string            `json:"currency"`
	Network         *string           `json:"network"`
	Address         string            `json:"address"`
	Fee             float64           `json:"fee"`
	Status          TransactionStatus `json:"status"`
	RejectionReason *string           `json:"rejection_reason"`
	ProcessedBy     *int64            `json:"processed_by"`
	ProcessedAt     *time.Time        `json:"processed_at"`
	CreatedAt       time.Time         `json:"created_at"`
}

// DepositAddress dirección de depósito
type DepositAddress struct {
	ID         int64     `json:"id"`
	UserID     int64     `json:"user_id"`
	Currency   string    `json:"currency"`
	Network    string    `json:"network"`
	Address    string    `json:"address"`
	IsActive   bool      `json:"is_active"`
	CreatedAt  time.Time `json:"created_at"`
}

// WalletSummary resumen de billeteras del usuario
type WalletSummary struct {
	LiveBalance       float64 `json:"live_balance"`
	DemoBalance       float64 `json:"demo_balance"`
	BonusBalance      float64 `json:"bonus_balance"`
	PendingWithdrawal float64 `json:"pending_withdrawal"`
	TotalDeposits     float64 `json:"total_deposits"`
	TotalWithdrawals  float64 `json:"total_withdrawals"`
}
