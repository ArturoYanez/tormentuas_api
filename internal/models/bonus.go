package models

import "time"

type Bonus struct {
	ID                 int64      `json:"id" db:"id"`
	Name               string     `json:"name" db:"name"`
	Description        string     `json:"description" db:"description"`
	Type               string     `json:"type" db:"type"`
	Amount             float64    `json:"amount" db:"amount"`
	Percentage         float64    `json:"percentage" db:"percentage"`
	MinDeposit         float64    `json:"min_deposit" db:"min_deposit"`
	MaxBonus           float64    `json:"max_bonus" db:"max_bonus"`
	RolloverMultiplier int        `json:"rollover_multiplier" db:"rollover_multiplier"`
	Code               string     `json:"code" db:"code"`
	IsActive           bool       `json:"is_active" db:"is_active"`
	StartsAt           *time.Time `json:"starts_at" db:"starts_at"`
	ExpiresAt          *time.Time `json:"expires_at" db:"expires_at"`
	CreatedAt          time.Time  `json:"created_at" db:"created_at"`
}

type UserBonus struct {
	ID                int64      `json:"id" db:"id"`
	UserID            int64      `json:"user_id" db:"user_id"`
	BonusID           int64      `json:"bonus_id" db:"bonus_id"`
	Amount            float64    `json:"amount" db:"amount"`
	RolloverRequired  float64    `json:"rollover_required" db:"rollover_required"`
	RolloverCompleted float64    `json:"rollover_completed" db:"rollover_completed"`
	Status            string     `json:"status" db:"status"`
	ActivatedAt       time.Time  `json:"activated_at" db:"activated_at"`
	CompletedAt       *time.Time `json:"completed_at" db:"completed_at"`
	ExpiresAt         *time.Time `json:"expires_at" db:"expires_at"`
	CreatedAt         time.Time  `json:"created_at" db:"created_at"`
	// Joined fields
	BonusName string `json:"bonus_name" db:"bonus_name"`
	BonusType string `json:"bonus_type" db:"bonus_type"`
	BonusCode string `json:"bonus_code" db:"bonus_code"`
}

type BonusStats struct {
	TotalEarned      float64 `json:"total_earned"`
	ActiveBonus      float64 `json:"active_bonus"`
	PendingRollover  float64 `json:"pending_rollover"`
	CompletedBonuses int     `json:"completed_bonuses"`
}
