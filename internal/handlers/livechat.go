package handlers

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ChatSession representa una sesión de chat en vivo
type ChatSession struct {
	ID        string        `json:"id"`
	UserID    int64         `json:"user_id"`
	AgentID   *int64        `json:"agent_id,omitempty"`
	Status    string        `json:"status"` // waiting, active, closed
	Messages  []ChatMessage `json:"messages"`
	CreatedAt time.Time     `json:"created_at"`
	UpdatedAt time.Time     `json:"updated_at"`
}

// ChatMessage representa un mensaje en el chat
type ChatMessage struct {
	ID        string    `json:"id"`
	SessionID string    `json:"session_id"`
	SenderID  int64     `json:"sender_id"`
	IsAgent   bool      `json:"is_agent"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}

// LiveChatHandler maneja el chat en vivo
type LiveChatHandler struct {
	sessions map[string]*ChatSession
	mu       sync.RWMutex
}

// NewLiveChatHandler crea un nuevo handler de chat en vivo
func NewLiveChatHandler() *LiveChatHandler {
	return &LiveChatHandler{
		sessions: make(map[string]*ChatSession),
	}
}

// StartChat inicia una nueva sesión de chat
func (h *LiveChatHandler) StartChat(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	// Verificar si ya tiene una sesión activa
	for _, session := range h.sessions {
		if session.UserID == userID.(int64) && session.Status != "closed" {
			c.JSON(http.StatusOK, gin.H{
				"session": session,
				"message": "Sesión existente encontrada",
			})
			return
		}
	}

	// Crear nueva sesión
	session := &ChatSession{
		ID:        uuid.New().String(),
		UserID:    userID.(int64),
		Status:    "waiting",
		Messages:  []ChatMessage{},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Mensaje de bienvenida automático
	welcomeMsg := ChatMessage{
		ID:        uuid.New().String(),
		SessionID: session.ID,
		SenderID:  0,
		IsAgent:   true,
		Message:   "¡Bienvenido al chat de soporte! Un agente estará contigo en breve. Mientras tanto, ¿en qué podemos ayudarte?",
		CreatedAt: time.Now(),
	}
	session.Messages = append(session.Messages, welcomeMsg)

	h.sessions[session.ID] = session

	c.JSON(http.StatusOK, gin.H{
		"session": session,
		"message": "Chat iniciado exitosamente",
	})
}

// SendMessage envía un mensaje en el chat
func (h *LiveChatHandler) SendMessage(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	var req struct {
		SessionID string `json:"session_id" binding:"required"`
		Message   string `json:"message" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	session, exists := h.sessions[req.SessionID]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sesión no encontrada"})
		return
	}

	if session.UserID != userID.(int64) {
		c.JSON(http.StatusForbidden, gin.H{"error": "No autorizado"})
		return
	}

	if session.Status == "closed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "La sesión está cerrada"})
		return
	}

	// Agregar mensaje del usuario
	userMsg := ChatMessage{
		ID:        uuid.New().String(),
		SessionID: session.ID,
		SenderID:  userID.(int64),
		IsAgent:   false,
		Message:   req.Message,
		CreatedAt: time.Now(),
	}
	session.Messages = append(session.Messages, userMsg)
	session.UpdatedAt = time.Now()

	// Simular respuesta automática del agente (en producción sería WebSocket)
	go func() {
		time.Sleep(2 * time.Second)
		h.mu.Lock()
		defer h.mu.Unlock()

		if s, ok := h.sessions[req.SessionID]; ok && s.Status != "closed" {
			agentMsg := ChatMessage{
				ID:        uuid.New().String(),
				SessionID: session.ID,
				SenderID:  0,
				IsAgent:   true,
				Message:   getAutoResponse(req.Message),
				CreatedAt: time.Now(),
			}
			s.Messages = append(s.Messages, agentMsg)
			s.Status = "active"
			s.UpdatedAt = time.Now()
		}
	}()

	c.JSON(http.StatusOK, gin.H{
		"message":  userMsg,
		"session":  session,
		"response": "Mensaje enviado",
	})
}

// EndChat termina una sesión de chat
func (h *LiveChatHandler) EndChat(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	var req struct {
		SessionID string `json:"session_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	session, exists := h.sessions[req.SessionID]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sesión no encontrada"})
		return
	}

	if session.UserID != userID.(int64) {
		c.JSON(http.StatusForbidden, gin.H{"error": "No autorizado"})
		return
	}

	session.Status = "closed"
	session.UpdatedAt = time.Now()

	// Mensaje de despedida
	byeMsg := ChatMessage{
		ID:        uuid.New().String(),
		SessionID: session.ID,
		SenderID:  0,
		IsAgent:   true,
		Message:   "Gracias por contactarnos. ¡Que tengas un excelente día!",
		CreatedAt: time.Now(),
	}
	session.Messages = append(session.Messages, byeMsg)

	c.JSON(http.StatusOK, gin.H{
		"message": "Chat finalizado",
		"session": session,
	})
}

// GetChatHistory obtiene el historial de un chat
func (h *LiveChatHandler) GetChatHistory(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	sessionID := c.Param("sessionId")

	h.mu.RLock()
	defer h.mu.RUnlock()

	session, exists := h.sessions[sessionID]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sesión no encontrada"})
		return
	}

	if session.UserID != userID.(int64) {
		c.JSON(http.StatusForbidden, gin.H{"error": "No autorizado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"session":  session,
		"messages": session.Messages,
	})
}

// getAutoResponse genera respuestas automáticas básicas
func getAutoResponse(message string) string {
	responses := []string{
		"Entiendo tu consulta. Déjame verificar eso por ti.",
		"Gracias por la información. Un momento mientras reviso.",
		"Estoy revisando tu caso. ¿Hay algo más que pueda ayudarte mientras tanto?",
		"He tomado nota de tu solicitud. Te responderé en breve.",
		"Gracias por tu paciencia. Estoy trabajando en tu consulta.",
	}
	return responses[time.Now().UnixNano()%int64(len(responses))]
}
