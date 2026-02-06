package models

import "time"

type Notification struct {
	ID        int64      `json:"id" db:"id"`
	UserID    int64      `json:"user_id" db:"user_id"`
	Type      string     `json:"type" db:"type"`
	Title     string     `json:"title" db:"title"`
	Message   string     `json:"message" db:"message"`
	Data      string     `json:"data" db:"data"`
	IsRead    bool       `json:"is_read" db:"is_read"`
	ReadAt    *time.Time `json:"read_at" db:"read_at"`
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
}

type NotificationSettings struct {
	ID                 int64     `json:"id" db:"id"`
	UserID             int64     `json:"user_id" db:"user_id"`
	EmailEnabled       bool      `json:"email_enabled" db:"email_enabled"`
	PushEnabled        bool      `json:"push_enabled" db:"push_enabled"`
	SmsEnabled         bool      `json:"sms_enabled" db:"sms_enabled"`
	TradesEnabled      bool      `json:"trades_enabled" db:"trades_enabled"`
	DepositsEnabled    bool      `json:"deposits_enabled" db:"deposits_enabled"`
	WithdrawalsEnabled bool      `json:"withdrawals_enabled" db:"withdrawals_enabled"`
	PromotionsEnabled  bool      `json:"promotions_enabled" db:"promotions_enabled"`
	NewsEnabled        bool      `json:"news_enabled" db:"news_enabled"`
	PriceAlertsEnabled bool      `json:"price_alerts_enabled" db:"price_alerts_enabled"`
	CreatedAt          time.Time `json:"created_at" db:"created_at"`
	UpdatedAt          time.Time `json:"updated_at" db:"updated_at"`
}

type PriceAlert struct {
	ID        int64      `json:"id" db:"id"`
	UserID    int64      `json:"user_id" db:"user_id"`
	Symbol    string     `json:"symbol" db:"symbol"`
	Condition string     `json:"condition" db:"condition"`
	Price     float64    `json:"price" db:"price"`
	Active    bool       `json:"active" db:"active"`
	Triggered bool       `json:"triggered" db:"triggered"`
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
	TriggeredAt *time.Time `json:"triggered_at" db:"triggered_at"`
}
