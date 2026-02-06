package models

import "time"

// ChartDrawing dibujos guardados en el gráfico
type ChartDrawing struct {
	ID        int64                  `json:"id" db:"id"`
	UserID    int64                  `json:"user_id" db:"user_id"`
	Symbol    string                 `json:"symbol" db:"symbol"`
	Type      string                 `json:"type" db:"type"` // horizontal, trend, fibonacci, rectangle
	Data      map[string]interface{} `json:"data" db:"data"`
	Color     string                 `json:"color" db:"color"`
	CreatedAt time.Time              `json:"created_at" db:"created_at"`
}

// UserFavorite pares favoritos del usuario
type UserFavorite struct {
	ID        int64     `json:"id" db:"id"`
	UserID    int64     `json:"user_id" db:"user_id"`
	Symbol    string    `json:"symbol" db:"symbol"`
	Position  int       `json:"position" db:"position"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// ChartLayout layouts de gráfico guardados
type ChartLayout struct {
	ID        int64                  `json:"id" db:"id"`
	UserID    int64                  `json:"user_id" db:"user_id"`
	Name      string                 `json:"name" db:"name"`
	Symbol    string                 `json:"symbol" db:"symbol"`
	Timeframe string                 `json:"timeframe" db:"timeframe"`
	Settings  map[string]interface{} `json:"settings" db:"settings"`
	IsDefault bool                   `json:"is_default" db:"is_default"`
	CreatedAt time.Time              `json:"created_at" db:"created_at"`
	UpdatedAt time.Time              `json:"updated_at" db:"updated_at"`
}

// ChartIndicator indicadores configurados por el usuario
type ChartIndicator struct {
	ID        int64                  `json:"id" db:"id"`
	UserID    int64                  `json:"user_id" db:"user_id"`
	Symbol    string                 `json:"symbol" db:"symbol"`
	Name      string                 `json:"name" db:"name"` // SMA, EMA, RSI, MACD, etc.
	Settings  map[string]interface{} `json:"settings" db:"settings"`
	Enabled   bool                   `json:"enabled" db:"enabled"`
	CreatedAt time.Time              `json:"created_at" db:"created_at"`
}

// TradeMarker marcadores de operaciones en el gráfico
type TradeMarker struct {
	ID         int64     `json:"id" db:"id"`
	TradeID    int64     `json:"trade_id" db:"trade_id"`
	UserID     int64     `json:"user_id" db:"user_id"`
	Symbol     string    `json:"symbol" db:"symbol"`
	Price      float64   `json:"price" db:"price"`
	Direction  string    `json:"direction" db:"direction"`
	Amount     float64   `json:"amount" db:"amount"`
	CandleTime time.Time `json:"candle_time" db:"candle_time"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}
