package handlers

import (
	"net/http"

	"tormentus/internal/websocket"

	"github.com/gin-gonic/gin"
)

// WebSocketHandler maneja las conexiones WebSocket
type WebSocketHandler struct {
	hub *websocket.Hub
}

// NewWebSocketHandler crea un nuevo handler de WebSocket
func NewWebSocketHandler(hub *websocket.Hub) *WebSocketHandler {
	return &WebSocketHandler{hub: hub}
}

// HandleWebSocket maneja la conexión WebSocket
func (h *WebSocketHandler) HandleWebSocket(c *gin.Context) {
	// Obtener userID si está autenticado (opcional para WebSocket)
	var userID int64 = 0
	if id, exists := c.Get("userID"); exists {
		userID = id.(int64)
	}

	websocket.ServeWs(h.hub, c.Writer, c.Request, userID)
}

// GetConnectionStats obtiene estadísticas de conexiones
func (h *WebSocketHandler) GetConnectionStats(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"connected_clients": h.hub.GetConnectedClients(),
	})
}
