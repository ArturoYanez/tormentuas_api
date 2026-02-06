package models

import "time"

type Referral struct {
	ID            int64     `json:"id" db:"id"`
	Email         string    `json:"email" db:"email"`
	Name          string    `json:"name" db:"name"`
	Status        string    `json:"status" db:"status"`
	TotalDeposits float64   `json:"total_deposits" db:"total_deposits"`
	Commission    float64   `json:"commission" db:"commission"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
}

type ReferralCommission struct {
	ID           int64      `json:"id" db:"id"`
	UserID       int64      `json:"user_id" db:"user_id"`
	ReferralID   int64      `json:"referral_id" db:"referral_id"`
	ReferralName string     `json:"referral_name" db:"referral_name"`
	Type         string     `json:"type" db:"type"`
	Amount       float64    `json:"amount" db:"amount"`
	SourceAmount float64    `json:"source_amount" db:"source_amount"`
	Status       string     `json:"status" db:"status"`
	PaidAt       *time.Time `json:"paid_at" db:"paid_at"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
}

type ReferralTier struct {
	ID                int64   `json:"id" db:"id"`
	Name              string  `json:"name" db:"name"`
	MinReferrals      int     `json:"min_referrals" db:"min_referrals"`
	DepositCommission float64 `json:"deposit_commission" db:"deposit_commission"`
	TradeCommission   float64 `json:"trade_commission" db:"trade_commission"`
	SignupBonus       float64 `json:"signup_bonus" db:"signup_bonus"`
}

type ReferralStats struct {
	TotalReferrals     int     `json:"total_referrals"`
	ActiveReferrals    int     `json:"active_referrals"`
	TotalCommissions   float64 `json:"total_commissions"`
	PendingCommissions float64 `json:"pending_commissions"`
	ThisMonth          float64 `json:"this_month"`
	ReferralCode       string  `json:"referral_code"`
	CurrentTier        string  `json:"current_tier"`
	CommissionRate     float64 `json:"commission_rate"`
}
