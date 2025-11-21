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
	"golang.org/x/net/websocket"
)

type BinanceWebSocket struct {
	conn    *websocket.Conn
	symbols []string
	priceCh chan models.PriceData
	done    chan struct{}
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
		streamNames = append(streamNames, fmt.SprintF("%s@ticker", symbol))
	}

	url := fmt.Sprintf("wss://stream.binance.com:9443/stream?streams=%s", strings.Join(streamNames, "/"))

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
	var msg struct {
		Stream string `json:"stream"`
		Data   struct {
			Symbol    string `json:"s"`
			Price     string `json:"c"`
			Volume    string `json:"v"`
			Timestamp int64  `json:"E"`
		} `json:"data"`
	}

	if err := json.Unmarshal(message, &msg); err != nil {
		log.Printf("Error parseando mensaje Binance: %v", err)
		return
	}

	// Convertir string a float64
	price, _ := strconv.ParseFloat(msg.Data.Price, 64)
	volume, _ := strconv.ParseFloat(msg.Data.Volume, 64)

	priceData := models.PriceData{
		Symbol:     msg.Data.Symbol,
		Price:      price,
		Volume:     volume,
		Timestramp: time.Unix(msg.Data.Timestamp/1000, 0),
	}

	// Select con Timeout para evitar bloqueos
	select {
	case b.priceCh <- priceData:
		// Mensaje enviado exitosamente
	case <-time.After(100 * time.Millisecond):
		log.Printf("Canal de preciosa lleno, descartando mensaje")
	}
}

// GetPriceChannel - expone el channel para que otros componentes reciban precios
func (b *BinanceWebSocket) GetPriceChannel() <-chan models.PriceData {
	return b.priceCh
}

// Close - cierra la conexion del websocket
func (h *BinanceWebSocket) Close() {
	close(b.done)
	if b.conn != nil {
		b.conn.Close()
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
