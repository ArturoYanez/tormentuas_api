package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
)

// UserRole representa el rol del usuario
type UserRole string

const (
	RoleUser       UserRole = "user"
	RoleAdmin      UserRole = "admin"
	RoleOperator   UserRole = "operator"
	RoleAccountant UserRole = "accountant"
	RoleSupport    UserRole = "support"
)

// User define la estructura de datos
type User struct {
	ID              int64              `json:"id" db:"id"`
	Email           string             `json:"email" db:"email"`
	Password        string             `json:"-" db:"password"`
	FirstName       string             `json:"first_name" db:"first_name"`
	LastName        string             `json:"last_name" db:"last_name"`
	Role            UserRole           `json:"role" db:"role"`
	Balance         float64            `json:"balance" db:"balance"`                   // Saldo real
	DemoBalance     float64            `json:"demo_balance" db:"demo_balance"`         // Saldo demo
	IsVerified      bool               `json:"is_verified" db:"is_verified"`           // Verificación KYC
	VerificationStatus VerificationStatus `json:"verification_status" db:"verification_status"`
	TotalDeposits   float64            `json:"total_deposits" db:"total_deposits"`
	TotalWithdrawals float64           `json:"total_withdrawals" db:"total_withdrawals"`
	TotalTrades     int                `json:"total_trades" db:"total_trades"`
	WinRate         float64            `json:"win_rate" db:"win_rate"`
	LastWinAt       *time.Time         `json:"last_win_at" db:"last_win_at"`           // Para el algoritmo
	ConsecutiveWins int                `json:"consecutive_wins" db:"consecutive_wins"` // Para el algoritmo
	CreatedAt       time.Time          `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time          `json:"updated_at" db:"updated_at"`
}

// HashPassword - Hashea la contraseña
func (u *User) HashPassword() error {
	hashed, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashed)
	return nil
}

// CheckPassword - Verifica password
func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

// CanTrade verifica si el usuario puede operar
func (u *User) CanTrade() bool {
	return u.IsVerified && u.VerificationStatus == VerificationApproved
}

type RefreshToken struct {
	ID        string    `json:"id" db:"id"`
	UserID    int64     `json:"user_id" db:"user_id"`
	Token     string    `json:"token" db:"token"`
	ExpiresAt time.Time `json:"expires_at" db:"expires_at"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}


// UserSettings configuración del usuario
type UserSettings struct {
	ID              int64   `json:"id"`
	UserID          int64   `json:"user_id"`
	Theme           string  `json:"theme"`
	Language        string  `json:"language"`
	Timezone        string  `json:"timezone"`
	Currency        string  `json:"currency"`
	SoundEffects    bool    `json:"sound_effects"`
	ShowBalance     bool    `json:"show_balance"`
	ConfirmTrades   bool    `json:"confirm_trades"`
	DefaultAmount   float64 `json:"default_amount"`
	DefaultDuration int     `json:"default_duration"`
}

// UserStats estadísticas del usuario
type UserStats struct {
	TotalTrades      int     `json:"total_trades"`
	WonTrades        int     `json:"won_trades"`
	LostTrades       int     `json:"lost_trades"`
	WinRate          float64 `json:"win_rate"`
	TotalProfit      float64 `json:"total_profit"`
	TotalLoss        float64 `json:"total_loss"`
	NetProfit        float64 `json:"net_profit"`
	TotalDeposits    float64 `json:"total_deposits"`
	TotalWithdrawals float64 `json:"total_withdrawals"`
	TournamentsJoined int    `json:"tournaments_joined"`
	BestTrade        float64 `json:"best_trade"`
	WorstTrade       float64 `json:"worst_trade"`
	AvgTradeAmount   float64 `json:"avg_trade_amount"`
}
