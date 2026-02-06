package models

import "time"

// TradeDirection representa la dirección de la operación
type TradeDirection string

const (
	TradeUp   TradeDirection = "up"   // Call/Compra
	TradeDown TradeDirection = "down" // Put/Venta
)

// TradeStatus representa el estado de la operación
type TradeStatus string

const (
	TradePending  TradeStatus = "pending"  // En curso
	TradeWon      TradeStatus = "won"      // Ganada
	TradeLost     TradeStatus = "lost"     // Perdida
	TradeCanceled TradeStatus = "canceled" // Cancelada
)

// Trade representa una operación de trading
type Trade struct {
	ID            int64          `json:"id"`
	UserID        int64          `json:"user_id"`
	Symbol        string         `json:"symbol"`
	Direction     TradeDirection `json:"direction"`
	Amount        float64        `json:"amount"`         // Monto invertido
	EntryPrice    float64        `json:"entry_price"`    // Precio de entrada
	ExitPrice     float64        `json:"exit_price"`     // Precio de salida
	Duration      int            `json:"duration"`       // Duración en segundos
	Status        TradeStatus    `json:"status"`
	Payout        float64        `json:"payout"`         // Porcentaje de ganancia (ej: 85%)
	Profit        float64        `json:"profit"`         // Ganancia/Pérdida real
	IsManipulated bool           `json:"is_manipulated"` // Si fue manipulado por el algoritmo
	IsDemo        bool           `json:"is_demo"`        // Si es cuenta demo
	TournamentID  *int64         `json:"tournament_id"`  // ID del torneo (si aplica)
	CreatedAt     time.Time      `json:"created_at"`
	ExpiresAt     time.Time      `json:"expires_at"`
	ClosedAt      *time.Time     `json:"closed_at"`
}

// TradeResult para el algoritmo de manipulación
type TradeResult struct {
	TradeID       int64   `json:"trade_id"`
	UserID        int64   `json:"user_id"`
	Amount        float64 `json:"amount"`
	IsWinner      bool    `json:"is_winner"`
	WinnerType    string  `json:"winner_type"` // "small_investor", "big_investor"
	ManipulatedAt time.Time
}


// TradeStats estadísticas de trading de un usuario
type TradeStats struct {
	TotalTrades int     `json:"total_trades"`
	Wins        int     `json:"wins"`
	Losses      int     `json:"losses"`
	WinRate     float64 `json:"win_rate"`
	TotalProfit float64 `json:"total_profit"`
	TotalVolume float64 `json:"total_volume"`
}
