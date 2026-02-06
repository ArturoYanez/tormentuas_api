package websocket

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"tormentus/internal/models"
)

// Hub mantiene el conjunto de clientes activos y broadcast de mensajes
type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mutex      sync.RWMutex

	// Precios actuales por símbolo
	prices map[string]*models.PriceData

	// Suscripciones por símbolo
	subscriptions map[string]map[*Client]bool
}

// NewHub crea un nuevo hub
func NewHub() *Hub {
	return &Hub{
		clients:       make(map[*Client]bool),
		broadcast:     make(chan []byte),
		register:      make(chan *Client),
		unregister:    make(chan *Client),
		prices:        make(map[string]*models.PriceData),
		subscriptions: make(map[string]map[*Client]bool),
	}
}

// Run inicia el hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mutex.Lock()
			h.clients[client] = true
			h.mutex.Unlock()
			log.Printf("Cliente conectado. Total: %d", len(h.clients))

		case client := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				// Remover de todas las suscripciones
				for symbol := range h.subscriptions {
					delete(h.subscriptions[symbol], client)
				}
			}
			h.mutex.Unlock()
			log.Printf("Cliente desconectado. Total: %d", len(h.clients))

		case message := <-h.broadcast:
			h.mutex.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mutex.RUnlock()
		}
	}
}

// Subscribe suscribe un cliente a un símbolo
func (h *Hub) Subscribe(client *Client, symbol string) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	if h.subscriptions[symbol] == nil {
		h.subscriptions[symbol] = make(map[*Client]bool)
	}
	h.subscriptions[symbol][client] = true
	log.Printf("Cliente suscrito a %s", symbol)
}

// Unsubscribe desuscribe un cliente de un símbolo
func (h *Hub) Unsubscribe(client *Client, symbol string) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	if h.subscriptions[symbol] != nil {
		delete(h.subscriptions[symbol], client)
	}
}

// BroadcastPrice envía precio a todos los suscritos a ese símbolo
func (h *Hub) BroadcastPrice(price *models.PriceData) {
	h.mutex.Lock()
	h.prices[price.Symbol] = price
	h.mutex.Unlock()

	msg := WSMessage{
		Type: "price_update",
		Data: price,
	}
	data, _ := json.Marshal(msg)

	h.mutex.RLock()
	defer h.mutex.RUnlock()

	if clients, ok := h.subscriptions[price.Symbol]; ok {
		for client := range clients {
			select {
			case client.send <- data:
			default:
			}
		}
	}
}

// BroadcastCandle envía vela a todos los suscritos
func (h *Hub) BroadcastCandle(candle *models.CandleData) {
	msg := WSMessage{
		Type: "candle_update",
		Data: candle,
	}
	data, _ := json.Marshal(msg)

	h.mutex.RLock()
	defer h.mutex.RUnlock()

	if clients, ok := h.subscriptions[candle.Symbol]; ok {
		for client := range clients {
			select {
			case client.send <- data:
			default:
			}
		}
	}
}

// GetPrice obtiene el precio actual de un símbolo
func (h *Hub) GetPrice(symbol string) *models.PriceData {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	return h.prices[symbol]
}

// BroadcastTradeResult envía resultado de trade a un usuario específico
func (h *Hub) BroadcastTradeResult(userID int64, trade *models.Trade) {
	msg := WSMessage{
		Type: "trade_result",
		Data: trade,
	}
	data, _ := json.Marshal(msg)

	h.mutex.RLock()
	defer h.mutex.RUnlock()

	for client := range h.clients {
		if client.userID == userID {
			select {
			case client.send <- data:
			default:
			}
		}
	}
}

// WSMessage estructura de mensaje WebSocket
type WSMessage struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

// WSClientMessage mensaje del cliente
type WSClientMessage struct {
	Action string `json:"action"` // subscribe, unsubscribe
	Symbol string `json:"symbol"`
}

// GetConnectedClients retorna el número de clientes conectados
func (h *Hub) GetConnectedClients() int {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	return len(h.clients)
}

// BroadcastToAll envía mensaje a todos los clientes
func (h *Hub) BroadcastToAll(msgType string, data interface{}) {
	msg := WSMessage{
		Type: msgType,
		Data: data,
	}
	jsonData, _ := json.Marshal(msg)

	h.mutex.RLock()
	defer h.mutex.RUnlock()

	for client := range h.clients {
		select {
		case client.send <- jsonData:
		default:
		}
	}
}

// StartHeartbeat inicia heartbeat para mantener conexiones vivas
func (h *Hub) StartHeartbeat() {
	ticker := time.NewTicker(30 * time.Second)
	go func() {
		for range ticker.C {
			h.BroadcastToAll("heartbeat", map[string]int64{"timestamp": time.Now().Unix()})
		}
	}()
}
