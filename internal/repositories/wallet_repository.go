package repositories

import (
	"context"
	"tormentus/internal/models"
)

// WalletRepository interface para operaciones de wallet
type WalletRepository interface {
	// Wallets
	GetUserWallets(ctx context.Context, userID int64) ([]*models.Wallet, error)
	GetWalletByType(ctx context.Context, userID int64, walletType models.WalletType) (*models.Wallet, error)
	CreateWallet(ctx context.Context, wallet *models.Wallet) error
	UpdateWalletBalance(ctx context.Context, walletID int64, amount float64) error
	GetWalletSummary(ctx context.Context, userID int64) (*models.WalletSummary, error)

	// Transactions
	CreateTransaction(ctx context.Context, tx *models.Transaction) error
	GetUserTransactions(ctx context.Context, userID int64, txType string, limit, offset int) ([]*models.Transaction, error)
	GetTransactionByID(ctx context.Context, id int64) (*models.Transaction, error)
	UpdateTransactionStatus(ctx context.Context, id int64, status models.TransactionStatus) error

	// Withdrawals
	CreateWithdrawalRequest(ctx context.Context, req *models.WithdrawalRequest) error
	GetUserWithdrawals(ctx context.Context, userID int64, status string, limit, offset int) ([]*models.WithdrawalRequest, error)
	GetWithdrawalByID(ctx context.Context, id int64) (*models.WithdrawalRequest, error)
	CancelWithdrawal(ctx context.Context, id int64, userID int64) error
	GetPendingWithdrawalAmount(ctx context.Context, userID int64) (float64, error)

	// Deposit Addresses
	GetDepositAddress(ctx context.Context, userID int64, currency, network string) (*models.DepositAddress, error)
	CreateDepositAddress(ctx context.Context, addr *models.DepositAddress) error
}
