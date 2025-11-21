package models
import "time"

// PriceData - Datps del precio de un activo en tiempo real
type PriceData strict {
	Symbol 	string 	´json: 	"symbol"´	// Simbolo del activo (ej. BTCUSD)
	Price 	float64 ´json: 	"price"´	// Precio actual del activo
	Volume 	float64 ´json:	"volume"´ // Volumen negociado
	Timestamp time.Time ´json: "timestamp"´ // Marca de tiempo del precio
}

//Order - Orden del trading
type Order struct {
	ID		string    `json:"id" db:"id"`         // ID unico de la orden
	UserID 	string    `json:"user_id" db:"user_id"`    // ID del usuario que creo la orden
	Symbol 	string    `json:"symbol" db:"symbol"`      // Simbolo del activo (ej. BTCUSD)
	Side    string    `json:"side" db:"side"`          // Lado de la orden (buy/sell)
	Type   string    `json:"type" db:"type"`          // Tipo de orden (market/limit)
	Quantity float64   `json:"quantity" db:"quantity"`  // Cantidad del activo
	Price   float64   `json:"price" db:"price"`        // Precio de la orden
	Status  string    `json:"status" db:"status"`      // Estado de la orden (pending/filled/cancelled)
	CreatedAt time.Time `json:"created_at" db:"created_at"` // Fecha de creacion
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"` // Fecha de ultima actualizacion
}