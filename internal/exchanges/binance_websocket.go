package exchanges

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"
	"tormentus/internal/models"

	"github.com/gorilla/websocket"
)

type BinanceWebSocket struct {
	conn     *websocket.Conn
	symbols  []string
	priceCh  chan models.PriceData
	done     chan struct{}
	isClosed bool
}

// NewBinanceWebsocket - Constructor
func NewBinanceWebSocket() *BinanceWebSocket {
	return &BinanceWebSocket{
		priceCh: make(chan models.PriceData, 100), //Buffer para performance
		done:    make(chan struct{}),
	}
}

// Connect - Establece conexion de websocket con Binance
func (b *BinanceWebSocket) Connect(symbols []string) error {
	b.symbols = symbols

	// Construir URL de Websocket Binance
	var streamNames []string
	for _, symbol := range symbols {
		streamNames = append(streamNames, fmt.Sprintf("%s@ticker", symbol))
	}

	url := fmt.Sprintf("wss://fstream.binance.com/stream?streams=%s", strings.Join(streamNames, "/"))

	var err error
	b.conn, _, err = websocket.DefaultDialer.Dial(url, nil)
	if err != nil {
		return fmt.Errorf("error conectando a Binance WebSocket: %v", err)
	}

	log.Printf("Conectado a Binance WebSocket para sumbolos: %v", symbols)
	return nil
}

// Start - Inicia la recepcion de datos (usando goroutines)
func (b *BinanceWebSocket) Start() {
	go b.readMessages()
}

// readMessages - Lee mensajes del websocket y los envia al canal de precios (Corre en goroutines)
func (b *BinanceWebSocket) readMessages() {
	defer close(b.priceCh)
	defer b.conn.Close()

	for {
		select {
		case <-b.done:
			return
		default:
			//Manejo de timeout con SetReadDeadline si es necesario
			b.conn.SetReadDeadline(time.Now().Add(10 * time.Second))

			_, message, err := b.conn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
					log.Printf("Error leyendo WebSocket Messages: %v", err)
				}
				return
			}

			// procesar mensaje
			b.processMessage(message)
		}
	}
}

// processMessage - Procesa un mensaje recibido del websocket
func (b *BinanceWebSocket) processMessage(message []byte) {
	log.Printf("📨 Mensaje raw recibido: %s", string(message))

	var msg struct {
		Stream string `json:"stream"`
		Data   struct {
			EventType   string      `json:"e"` // "24hrTicker"
			EventTime   int64       `json:"E"` // Timestamp del evento (número)
			Symbol      string      `json:"s"` // "BTCUSDT"
			LastPrice   json.Number `json:"c"` // Precio de cierre actual
			Volume      json.Number `json:"v"` // Volumen base asset
			HighPrice   json.Number `json:"h"` // Precio más alto
			LowPrice    json.Number `json:"l"` // Precio más bajo
			OpenPrice   json.Number `json:"o"` // Precio de apertura
			PriceChange json.Number `json:"p"` // Cambio de precio
		} `json:"data"`
	}

	if err := json.Unmarshal(message, &msg); err != nil {
		log.Printf("Error parseando mensaje Binance: %v", err)
		return
	}

	// Solo procesar mensajes de tipo "24hrTicker"
	if msg.Data.EventType != "24hrTicker" {
		return
	}

	// verificacion de que tenemos datos válidos
	if msg.Data.Symbol == "" {
		log.Printf("⚠️ Mensaje sin símbolo, ignorando")
		return
	}

	// Convertir precios a float64
	currentPrice, err := strconv.ParseFloat(msg.Data.LastPrice.String(), 64)
	if err != nil {
		log.Printf("Error parseando precio: %v", err)
		return
	}

	volume, err := strconv.ParseFloat(msg.Data.Volume.String(), 64)
	if err != nil {
		log.Printf("Error parseando volumen: %v", err)
		return
	}

	priceData := models.PriceData{
		Symbol:    msg.Data.Symbol,
		Price:     currentPrice,
		Volume:    volume,
		Timestamp: time.Unix(msg.Data.EventTime/1000, 0),
	}

	log.Printf("Precio procesado: %s - $%.2f", priceData.Symbol, priceData.Price)

	// Select con Timeout para evitar bloqueos
	select {
	case b.priceCh <- priceData:
		// Mensaje enviado exitosamente
	case <-time.After(100 * time.Millisecond):
		log.Printf("Canal de precios lleno, descartando mensaje")
	}
}

// GetPriceChannel - expone el channel para que otros componentes reciban precios
func (b *BinanceWebSocket) GetPriceChannel() <-chan models.PriceData {
	return b.priceCh
}

// Close - cierra la conexion del websocket
func (h *BinanceWebSocket) Close() {
	close(h.done)
	if h.conn != nil {
		h.conn.Close()
	}
}

// joinStream - helper para unir nombres de streams
func joinStreams(streams []string) string {
	result := ""
	for i, stream := range streams {
		if i > 0 {
			result += "/"
		}
		result += stream
	}
	return result
}
