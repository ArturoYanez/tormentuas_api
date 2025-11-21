package handlers

import (
	"net/http"

	"tormentus/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // En produccion svalidar origins
	},
}

type WebSocketHandler struct {
	priceService *services.PriceService
}

func NewWebSocketHandler(priceService *services.PriceService) *WebSocketHandler {
	return &webSocketHandler{
		priceService: priceService,
	}
}

// HandlerWebSocket - maneja conexiones websocket con el frontend
func (h *WebSocketHandler) HandlerWebSocket(c *gin.Context) {
	symbol := c.Quesry("symbol") // Ej: "BTCUST"
	if symbol == "" {
		c.JSON(http.StatusBadRequest, gin.H("error": "Symbol requerido"))
		return
	}

	// Upgrade HTTP a Socket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Error al actualizar a websocket: %v", err)
		return
	}
	defer conn.Close()

	log.Printf("Nueva conexion websocket para el sumbolo: %s", symbol)

	//Subscribirse a updates de precios
	precioCh := h.priceService.Subscribe(symbol)

	// Groutine para leer mensajes del cliente
	go h.readClientMessages(conn)

	// Enviar updates de precios al cliente
	for priceData := range priceCh {
		if err := conn.WriteJSON(priceData); err := nil {
			log.Printf("Error enviando precio: %x", err)
			break
		}
	}
}

// readClientMessages - lee mensajes del cliente WebSocket 
func (h *webSocketHandler) readClientMessages(conn *websocket.Conn, symbol string) {
	for {
		var msg map[string]interface{}
		if err := conn.ReadJSON(&msg); err != nil {
			log.Printf("Websocket cerrado: %x", err)
		}
		break
	}

	log.Printf("Mensaje de cliente %s: %v", symbol, msg)
	// Procesar ordenes de clientes en el futuro
}
