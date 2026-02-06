package models

import "time"

// MarketType representa el tipo de mercado
type MarketType string

const (
	MarketForex       MarketType = "forex"
	MarketCrypto      MarketType = "crypto"
	MarketCommodities MarketType = "commodities"
	MarketStocks      MarketType = "stocks"
)

// Asset representa un activo negociable
type Asset struct {
	ID         int64      `json:"id"`
	Symbol     string     `json:"symbol"`      // EUR/USD, BTC/USDT, etc.
	Name       string     `json:"name"`        // Euro/US Dollar
	MarketType MarketType `json:"market_type"` // forex, crypto, etc.
	IsActive   bool       `json:"is_active"`
	CreatedAt  time.Time  `json:"created_at"`
}

// PriceData representa datos de precio en tiempo real
type PriceData struct {
	Symbol    string    `json:"symbol"`
	Price     float64   `json:"price"`
	Bid       float64   `json:"bid"`
	Ask       float64   `json:"ask"`
	High24h   float64   `json:"high_24h"`
	Low24h    float64   `json:"low_24h"`
	Change24h float64   `json:"change_24h"`
	Volume    float64   `json:"volume"`
	Timestamp time.Time `json:"timestamp"`
}

// CandleData representa una vela para el gráfico
type CandleData struct {
	Symbol    string    `json:"symbol"`
	Open      float64   `json:"open"`
	High      float64   `json:"high"`
	Low       float64   `json:"low"`
	Close     float64   `json:"close"`
	Volume    float64   `json:"volume"`
	Timestamp time.Time `json:"timestamp"`
}
