package handlers

import (
	"net/http"
	"strconv"
	"time"

	"tormentus/internal/repositories"

	"github.com/gin-gonic/gin"
)

// SupportAgentDBHandler maneja las operaciones del panel de soporte con BD
type SupportAgentDBHandler struct {
	repo *repositories.SupportAgentRepository
}

// NewSupportAgentDBHandler crea un nuevo handler
func NewSupportAgentDBHandler(repo *repositories.SupportAgentRepository) *SupportAgentDBHandler {
	return &SupportAgentDBHandler{repo: repo}
}

// ========== DASHBOARD ==========

// GetDashboardStats obtiene estadísticas del dashboard
func (h *SupportAgentDBHandler) GetDashboardStats(c *gin.Context) {
	ctx := c.Request.Context()
	stats, err := h.repo.GetDashboardStats(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estadísticas", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats)
}

// ========== TICKETS ==========

// GetAllTickets obtiene todos los tickets
func (h *SupportAgentDBHandler) GetAllTickets(c *gin.Context) {
	ctx := c.Request.Context()
	status := c.DefaultQuery("status", "all")
	priority := c.DefaultQuery("priority", "all")
	category := c.DefaultQuery("category", "all")

	tickets, err := h.repo.GetAllTickets(ctx, status, priority, category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo tickets", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"tickets": tickets, "total": len(tickets)})
}

// GetTicketByID obtiene un ticket específico
func (h *SupportAgentDBHandler) GetTicketByID(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	ticket, messages, err := h.repo.GetTicketByID(ctx, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket no encontrado"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ticket": ticket, "messages": messages})
}

// UpdateTicket actualiza un ticket
func (h *SupportAgentDBHandler) UpdateTicket(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var req struct {
		Status     *string  `json:"status"`
		Priority   *string  `json:"priority"`
		AssignedTo *int64   `json:"assigned_to"`
		Tags       []string `json:"tags"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.UpdateTicket(ctx, id, req.Status, req.Priority, req.AssignedTo, req.Tags)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando ticket"})
		return
	}

	ticket, messages, _ := h.repo.GetTicketByID(ctx, id)
	c.JSON(http.StatusOK, gin.H{"ticket": ticket, "messages": messages, "message": "Ticket actualizado"})
}

// ReplyToTicket responde a un ticket
func (h *SupportAgentDBHandler) ReplyToTicket(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	var req struct {
		Message string `json:"message" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	msg, err := h.repo.AddTicketMessage(ctx, id, agentID.(int64), "support", req.Message, false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error enviando mensaje"})
		return
	}

	ticket, messages, _ := h.repo.GetTicketByID(ctx, id)
	c.JSON(http.StatusOK, gin.H{"message": msg, "ticket": ticket, "messages": messages})
}

// AddInternalNote agrega nota interna
func (h *SupportAgentDBHandler) AddInternalNote(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	var req struct {
		Note string `json:"note" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	note, err := h.repo.AddTicketMessage(ctx, id, agentID.(int64), "support", req.Note, true)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error agregando nota"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"note": note})
}

// EscalateTicket escala un ticket
func (h *SupportAgentDBHandler) EscalateTicket(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var req struct {
		EscalateTo string `json:"escalate_to" binding:"required"`
		Reason     string `json:"reason"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	status := "escalated"
	err := h.repo.UpdateTicket(ctx, id, &status, nil, nil, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error escalando ticket"})
		return
	}

	ticket, messages, _ := h.repo.GetTicketByID(ctx, id)
	c.JSON(http.StatusOK, gin.H{"ticket": ticket, "messages": messages, "message": "Ticket escalado"})
}

// ========== LIVE CHATS ==========

// GetLiveChats obtiene todos los chats en vivo
func (h *SupportAgentDBHandler) GetLiveChats(c *gin.Context) {
	ctx := c.Request.Context()
	status := c.DefaultQuery("status", "all")

	chats, err := h.repo.GetLiveChats(ctx, status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo chats", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"chats": chats, "total": len(chats)})
}

// GetLiveChatByID obtiene un chat específico con sus mensajes
func (h *SupportAgentDBHandler) GetLiveChatByID(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	chat, err := h.repo.GetLiveChatByID(ctx, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chat no encontrado"})
		return
	}

	messages, _ := h.repo.GetLiveChatMessages(ctx, id)
	c.JSON(http.StatusOK, gin.H{"chat": chat, "messages": messages})
}

// AcceptChat acepta un chat en espera
func (h *SupportAgentDBHandler) AcceptChat(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	err := h.repo.AcceptChat(ctx, id, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error aceptando chat"})
		return
	}

	chat, _ := h.repo.GetLiveChatByID(ctx, id)
	messages, _ := h.repo.GetLiveChatMessages(ctx, id)
	c.JSON(http.StatusOK, gin.H{"chat": chat, "messages": messages, "message": "Chat aceptado"})
}

// SendChatMessage envía un mensaje en el chat
func (h *SupportAgentDBHandler) SendChatMessage(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	var req struct {
		Message string `json:"message" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	msg, err := h.repo.AddChatMessage(ctx, id, agentID.(int64), "support", req.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error enviando mensaje"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": msg})
}

// EndLiveChat termina un chat
func (h *SupportAgentDBHandler) EndLiveChat(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	err := h.repo.EndChat(ctx, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error terminando chat"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Chat terminado"})
}

// ========== FAQs ==========

// GetFAQs obtiene todas las FAQs
func (h *SupportAgentDBHandler) GetFAQs(c *gin.Context) {
	ctx := c.Request.Context()
	category := c.DefaultQuery("category", "all")

	faqs, err := h.repo.GetFAQs(ctx, category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo FAQs", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"faqs": faqs, "total": len(faqs)})
}

// CreateFAQ crea una nueva FAQ
func (h *SupportAgentDBHandler) CreateFAQ(c *gin.Context) {
	ctx := c.Request.Context()

	var req struct {
		Question    string `json:"question" binding:"required"`
		Answer      string `json:"answer" binding:"required"`
		Category    string `json:"category"`
		IsPublished bool   `json:"is_published"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	faq, err := h.repo.CreateFAQ(ctx, req.Question, req.Answer, req.Category, req.IsPublished)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando FAQ", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"faq": faq, "message": "FAQ creada"})
}

// UpdateFAQ actualiza una FAQ
func (h *SupportAgentDBHandler) UpdateFAQ(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var req struct {
		Question    *string `json:"question"`
		Answer      *string `json:"answer"`
		IsPublished *bool   `json:"is_published"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.UpdateFAQ(ctx, id, req.Question, req.Answer, req.IsPublished)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando FAQ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "FAQ actualizada"})
}

// DeleteFAQ elimina una FAQ
func (h *SupportAgentDBHandler) DeleteFAQ(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	err := h.repo.DeleteFAQ(ctx, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando FAQ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "FAQ eliminada"})
}

// ========== TEMPLATES ==========

// GetTemplates obtiene todas las plantillas
func (h *SupportAgentDBHandler) GetTemplates(c *gin.Context) {
	ctx := c.Request.Context()
	category := c.DefaultQuery("category", "all")

	templates, err := h.repo.GetTemplates(ctx, category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo plantillas", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"templates": templates, "total": len(templates)})
}

// CreateTemplate crea una nueva plantilla
func (h *SupportAgentDBHandler) CreateTemplate(c *gin.Context) {
	ctx := c.Request.Context()

	var req struct {
		Name      string   `json:"name" binding:"required"`
		Shortcut  string   `json:"shortcut" binding:"required"`
		Category  string   `json:"category"`
		Content   string   `json:"content" binding:"required"`
		Variables []string `json:"variables"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	template, err := h.repo.CreateTemplate(ctx, req.Name, req.Shortcut, req.Category, req.Content, req.Variables)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando plantilla", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"template": template, "message": "Plantilla creada"})
}

// UpdateTemplate actualiza una plantilla
func (h *SupportAgentDBHandler) UpdateTemplate(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var req struct {
		Name     *string `json:"name"`
		Shortcut *string `json:"shortcut"`
		Category *string `json:"category"`
		Content  *string `json:"content"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.UpdateTemplate(ctx, id, req.Name, req.Shortcut, req.Category, req.Content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando plantilla"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Plantilla actualizada"})
}

// DeleteTemplate elimina una plantilla
func (h *SupportAgentDBHandler) DeleteTemplate(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	err := h.repo.DeleteTemplate(ctx, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando plantilla"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Plantilla eliminada"})
}

// ========== KNOWLEDGE BASE ==========

// GetKnowledgeArticles obtiene todos los artículos
func (h *SupportAgentDBHandler) GetKnowledgeArticles(c *gin.Context) {
	ctx := c.Request.Context()
	category := c.DefaultQuery("category", "all")

	articles, err := h.repo.GetKnowledgeArticles(ctx, category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo artículos", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"articles": articles, "total": len(articles)})
}

// CreateKnowledgeArticle crea un nuevo artículo
func (h *SupportAgentDBHandler) CreateKnowledgeArticle(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req struct {
		Title       string   `json:"title" binding:"required"`
		Category    string   `json:"category"`
		Content     string   `json:"content" binding:"required"`
		Tags        []string `json:"tags"`
		IsPublished bool     `json:"is_published"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	article, err := h.repo.CreateKnowledgeArticle(ctx, agentID.(int64), req.Title, req.Category, req.Content, req.Tags, req.IsPublished)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando artículo", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"article": article, "message": "Artículo creado"})
}

// UpdateKnowledgeArticle actualiza un artículo
func (h *SupportAgentDBHandler) UpdateKnowledgeArticle(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var req struct {
		Title       *string  `json:"title"`
		Category    *string  `json:"category"`
		Content     *string  `json:"content"`
		Tags        []string `json:"tags"`
		IsPublished *bool    `json:"is_published"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.UpdateKnowledgeArticle(ctx, id, req.Title, req.Category, req.Content, req.Tags, req.IsPublished)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando artículo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Artículo actualizado"})
}

// DeleteKnowledgeArticle elimina un artículo
func (h *SupportAgentDBHandler) DeleteKnowledgeArticle(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	err := h.repo.DeleteKnowledgeArticle(ctx, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando artículo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Artículo eliminado"})
}

// ========== USERS ==========

// GetUsers obtiene usuarios
func (h *SupportAgentDBHandler) GetUsers(c *gin.Context) {
	ctx := c.Request.Context()
	search := c.DefaultQuery("search", "")

	users, err := h.repo.GetUsers(ctx, search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo usuarios", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"users": users, "total": len(users)})
}

// GetUserByID obtiene un usuario por ID
func (h *SupportAgentDBHandler) GetUserByID(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	user, err := h.repo.GetUserByID(ctx, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}

	// Obtener tickets del usuario
	tickets, _ := h.repo.GetUserTickets(ctx, id)
	// Obtener notas del usuario
	notes, _ := h.repo.GetUserNotes(ctx, id)

	c.JSON(http.StatusOK, gin.H{"user": user, "tickets": tickets, "notes": notes})
}

// AddUserNote agrega una nota a un usuario
func (h *SupportAgentDBHandler) AddUserNote(c *gin.Context) {
	ctx := c.Request.Context()
	userID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	var req struct {
		Note string `json:"note" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	note, err := h.repo.AddUserNote(ctx, userID, agentID.(int64), req.Note)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error agregando nota"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"note": note, "message": "Nota agregada"})
}


// ========== NOTIFICATIONS ==========

// GetNotifications obtiene notificaciones del agente
func (h *SupportAgentDBHandler) GetNotifications(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")
	unreadOnly := c.DefaultQuery("unread_only", "false") == "true"

	notifications, err := h.repo.GetAgentNotifications(ctx, agentID.(int64), unreadOnly)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo notificaciones"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"notifications": notifications, "total": len(notifications)})
}

// GetUnreadCount obtiene conteo de no leídas
func (h *SupportAgentDBHandler) GetUnreadCount(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	count, err := h.repo.GetUnreadNotificationCount(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo conteo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"count": count})
}

// MarkNotificationRead marca notificación como leída
func (h *SupportAgentDBHandler) MarkNotificationRead(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")
	notifID, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	err := h.repo.MarkNotificationRead(ctx, notifID, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error marcando notificación"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Notificación marcada como leída"})
}

// MarkAllNotificationsRead marca todas como leídas
func (h *SupportAgentDBHandler) MarkAllNotificationsRead(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	err := h.repo.MarkAllNotificationsRead(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error marcando notificaciones"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Todas las notificaciones marcadas como leídas"})
}

// ========== CANNED RESPONSES ==========

// GetCannedResponses obtiene respuestas rápidas
func (h *SupportAgentDBHandler) GetCannedResponses(c *gin.Context) {
	ctx := c.Request.Context()
	category := c.DefaultQuery("category", "all")

	responses, err := h.repo.GetCannedResponses(ctx, category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo respuestas"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"canned_responses": responses, "total": len(responses)})
}

// CreateCannedResponse crea respuesta rápida
func (h *SupportAgentDBHandler) CreateCannedResponse(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req struct {
		Shortcut string `json:"shortcut" binding:"required"`
		Title    string `json:"title" binding:"required"`
		Content  string `json:"content" binding:"required"`
		Category string `json:"category"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := h.repo.CreateCannedResponse(ctx, req.Shortcut, req.Title, req.Content, req.Category, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando respuesta"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"canned_response": response, "message": "Respuesta creada"})
}

// UpdateCannedResponse actualiza respuesta rápida
func (h *SupportAgentDBHandler) UpdateCannedResponse(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var req struct {
		Shortcut *string `json:"shortcut"`
		Title    *string `json:"title"`
		Content  *string `json:"content"`
		Category *string `json:"category"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.UpdateCannedResponse(ctx, id, req.Shortcut, req.Title, req.Content, req.Category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando respuesta"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Respuesta actualizada"})
}

// DeleteCannedResponse elimina respuesta rápida
func (h *SupportAgentDBHandler) DeleteCannedResponse(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	err := h.repo.DeleteCannedResponse(ctx, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando respuesta"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Respuesta eliminada"})
}

// ========== MACROS ==========

// GetMacros obtiene macros
func (h *SupportAgentDBHandler) GetMacros(c *gin.Context) {
	ctx := c.Request.Context()

	macros, err := h.repo.GetMacros(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo macros"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"macros": macros, "total": len(macros)})
}

// CreateMacro crea macro
func (h *SupportAgentDBHandler) CreateMacro(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
		Actions     string `json:"actions" binding:"required"` // JSON string
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	macro, err := h.repo.CreateMacro(ctx, req.Name, req.Description, req.Actions, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando macro"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"macro": macro, "message": "Macro creado"})
}

// UpdateMacro actualiza macro
func (h *SupportAgentDBHandler) UpdateMacro(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var req struct {
		Name        *string `json:"name"`
		Description *string `json:"description"`
		Actions     *string `json:"actions"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.UpdateMacro(ctx, id, req.Name, req.Description, req.Actions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando macro"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Macro actualizado"})
}

// DeleteMacro elimina macro
func (h *SupportAgentDBHandler) DeleteMacro(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	err := h.repo.DeleteMacro(ctx, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando macro"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Macro eliminado"})
}

// ========== AGENTS ==========

// GetAgentsList obtiene lista de agentes
func (h *SupportAgentDBHandler) GetAgentsList(c *gin.Context) {
	ctx := c.Request.Context()

	agents, err := h.repo.GetAgents(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo agentes"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"agents": agents, "total": len(agents)})
}

// UpdateAgentStatus actualiza estado del agente
func (h *SupportAgentDBHandler) UpdateAgentStatus(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req struct {
		Status        string `json:"status" binding:"required"`
		StatusMessage string `json:"status_message"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.UpdateAgentStatus(ctx, agentID.(int64), req.Status, req.StatusMessage)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando estado"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Estado actualizado", "status": req.Status})
}

// ========== INTERNAL CHAT ==========

// GetInternalMessages obtiene mensajes internos
func (h *SupportAgentDBHandler) GetInternalMessages(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")
	channel := c.DefaultQuery("channel", "general")

	agentIDInt := agentID.(int64)
	messages, err := h.repo.GetInternalMessages(ctx, channel, &agentIDInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo mensajes"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"messages": messages, "total": len(messages)})
}

// SendInternalMessage envía mensaje interno
func (h *SupportAgentDBHandler) SendInternalMessage(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req struct {
		RecipientID *int64 `json:"recipient_id"`
		Channel     string `json:"channel"`
		Message     string `json:"message" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Channel == "" {
		req.Channel = "general"
	}

	msg, err := h.repo.SendInternalMessage(ctx, agentID.(int64), req.RecipientID, req.Channel, req.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error enviando mensaje"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": msg})
}

// ========== SETTINGS ==========

// GetAgentSettings obtiene configuración del agente
func (h *SupportAgentDBHandler) GetAgentSettings(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	settings, err := h.repo.GetAgentSettings(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo configuración"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"settings": settings})
}

// UpdateAgentSettings actualiza configuración
func (h *SupportAgentDBHandler) UpdateAgentSettings(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.UpdateAgentSettings(ctx, agentID.(int64), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando configuración"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Configuración actualizada"})
}

// ========== REPORTS ==========

// GetReportStats obtiene estadísticas para reportes
func (h *SupportAgentDBHandler) GetReportStats(c *gin.Context) {
	ctx := c.Request.Context()
	startDate := c.DefaultQuery("start_date", "2025-01-01")
	endDate := c.DefaultQuery("end_date", "2025-12-31")

	stats, err := h.repo.GetReportStats(ctx, startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estadísticas"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"stats": stats})
}


// ========== TICKET TAGS ==========

// AddTicketTag agrega un tag a un ticket
func (h *SupportAgentDBHandler) AddTicketTag(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var req struct {
		Tag string `json:"tag" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.AddTicketTag(ctx, id, req.Tag)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error agregando tag"})
		return
	}

	ticket, messages, _ := h.repo.GetTicketByID(ctx, id)
	c.JSON(http.StatusOK, gin.H{"ticket": ticket, "messages": messages, "message": "Tag agregado"})
}

// RemoveTicketTag elimina un tag de un ticket
func (h *SupportAgentDBHandler) RemoveTicketTag(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	tag := c.Param("tag")

	err := h.repo.RemoveTicketTag(ctx, id, tag)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando tag"})
		return
	}

	ticket, messages, _ := h.repo.GetTicketByID(ctx, id)
	c.JSON(http.StatusOK, gin.H{"ticket": ticket, "messages": messages, "message": "Tag eliminado"})
}

// ========== TICKET COLLABORATORS ==========

// AddCollaborator agrega un colaborador a un ticket
func (h *SupportAgentDBHandler) AddCollaborator(c *gin.Context) {
	ctx := c.Request.Context()
	ticketID, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var req struct {
		AgentID int64 `json:"agent_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.AddTicketCollaborator(ctx, ticketID, req.AgentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error agregando colaborador"})
		return
	}

	collaborators, _ := h.repo.GetTicketCollaborators(ctx, ticketID)
	c.JSON(http.StatusOK, gin.H{"collaborators": collaborators, "message": "Colaborador agregado"})
}

// RemoveCollaborator elimina un colaborador de un ticket
func (h *SupportAgentDBHandler) RemoveCollaborator(c *gin.Context) {
	ctx := c.Request.Context()
	ticketID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := strconv.ParseInt(c.Param("agentId"), 10, 64)

	err := h.repo.RemoveTicketCollaborator(ctx, ticketID, agentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando colaborador"})
		return
	}

	collaborators, _ := h.repo.GetTicketCollaborators(ctx, ticketID)
	c.JSON(http.StatusOK, gin.H{"collaborators": collaborators, "message": "Colaborador eliminado"})
}

// ========== MERGE TICKETS ==========

// MergeTickets fusiona tickets
func (h *SupportAgentDBHandler) MergeTickets(c *gin.Context) {
	ctx := c.Request.Context()
	primaryID, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var req struct {
		SecondaryIDs []int64 `json:"secondary_ids" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.MergeTickets(ctx, primaryID, req.SecondaryIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fusionando tickets"})
		return
	}

	ticket, messages, _ := h.repo.GetTicketByID(ctx, primaryID)
	c.JSON(http.StatusOK, gin.H{"ticket": ticket, "messages": messages, "message": "Tickets fusionados"})
}

// ========== TICKET RATING ==========

// RequestTicketRating solicita calificación
func (h *SupportAgentDBHandler) RequestTicketRating(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	err := h.repo.RequestTicketRating(ctx, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error solicitando calificación"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Solicitud de calificación enviada"})
}

// ========== TEMPLATE FAVORITES ==========

// ToggleTemplateFavorite alterna favorito
func (h *SupportAgentDBHandler) ToggleTemplateFavorite(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	isFavorite, err := h.repo.ToggleTemplateFavorite(ctx, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando favorito"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"is_favorite": isFavorite, "message": "Favorito actualizado"})
}

// IncrementTemplateUsage incrementa uso de plantilla
func (h *SupportAgentDBHandler) IncrementTemplateUsage(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	err := h.repo.IncrementTemplateUsage(ctx, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error incrementando uso"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Uso incrementado"})
}

// ========== AGENT NOTES (Personal) ==========

// GetAgentNotes obtiene notas personales
func (h *SupportAgentDBHandler) GetAgentNotes(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	notes, err := h.repo.GetAgentNotes(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo notas"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"notes": notes, "total": len(notes)})
}

// CreateAgentNote crea nota personal
func (h *SupportAgentDBHandler) CreateAgentNote(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req struct {
		Content string `json:"content" binding:"required"`
		Color   string `json:"color"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	note, err := h.repo.CreateAgentNote(ctx, agentID.(int64), req.Content, req.Color)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando nota"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"note": note, "message": "Nota creada"})
}

// DeleteAgentNote elimina nota personal
func (h *SupportAgentDBHandler) DeleteAgentNote(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")
	noteID, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	err := h.repo.DeleteAgentNote(ctx, noteID, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando nota"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Nota eliminada"})
}

// ========== CHAT NOTES ==========

// GetChatNotes obtiene notas de un chat
func (h *SupportAgentDBHandler) GetChatNotes(c *gin.Context) {
	ctx := c.Request.Context()
	chatID, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	notes, err := h.repo.GetChatNotes(ctx, chatID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo notas"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"notes": notes})
}

// AddChatNote agrega nota a un chat
func (h *SupportAgentDBHandler) AddChatNote(c *gin.Context) {
	ctx := c.Request.Context()
	chatID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	var req struct {
		Note string `json:"note" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	note, err := h.repo.AddChatNote(ctx, chatID, agentID.(int64), req.Note)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error agregando nota"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"note": note, "message": "Nota agregada"})
}

// ========== CREATE TICKET FROM CHAT ==========

// CreateTicketFromChat crea ticket desde chat
func (h *SupportAgentDBHandler) CreateTicketFromChat(c *gin.Context) {
	ctx := c.Request.Context()
	chatID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	ticket, err := h.repo.CreateTicketFromChat(ctx, chatID, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando ticket", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"ticket": ticket, "message": "Ticket creado desde chat"})
}

// ========== BULK OPERATIONS ==========

// BulkAssignTickets asigna múltiples tickets
func (h *SupportAgentDBHandler) BulkAssignTickets(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req struct {
		TicketIDs []int64 `json:"ticket_ids" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.BulkAssignTickets(ctx, req.TicketIDs, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error asignando tickets"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tickets asignados", "count": len(req.TicketIDs)})
}

// BulkEscalateTickets escala múltiples tickets
func (h *SupportAgentDBHandler) BulkEscalateTickets(c *gin.Context) {
	ctx := c.Request.Context()

	var req struct {
		TicketIDs  []int64 `json:"ticket_ids" binding:"required"`
		EscalateTo string  `json:"escalate_to"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.EscalateTo == "" {
		req.EscalateTo = "operator"
	}

	err := h.repo.BulkEscalateTickets(ctx, req.TicketIDs, req.EscalateTo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error escalando tickets"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tickets escalados", "count": len(req.TicketIDs)})
}

// ========== CHAT RATING ==========

// RequestChatRating solicita calificación de chat
func (h *SupportAgentDBHandler) RequestChatRating(c *gin.Context) {
	ctx := c.Request.Context()
	chatID, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	err := h.repo.RequestChatRating(ctx, chatID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error solicitando calificación"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Solicitud de calificación enviada"})
}

// ========== TRANSFER TICKET ==========

// TransferTicket transfiere un ticket
func (h *SupportAgentDBHandler) TransferTicket(c *gin.Context) {
	ctx := c.Request.Context()
	ticketID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	fromAgentID, _ := c.Get("userID")

	var req struct {
		ToAgentID int64  `json:"to_agent_id" binding:"required"`
		Reason    string `json:"reason"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.TransferTicket(ctx, ticketID, fromAgentID.(int64), req.ToAgentID, req.Reason)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error transfiriendo ticket"})
		return
	}

	ticket, messages, _ := h.repo.GetTicketByID(ctx, ticketID)
	c.JSON(http.StatusOK, gin.H{"ticket": ticket, "messages": messages, "message": "Ticket transferido"})
}


// ========== AGENT SCHEDULE ==========

// GetAgentSchedule obtiene el horario del agente
func (h *SupportAgentDBHandler) GetAgentSchedule(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	schedule, err := h.repo.GetAgentSchedule(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo horario"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"schedule": schedule})
}

// UpdateAgentSchedule actualiza el horario de un día
func (h *SupportAgentDBHandler) UpdateAgentSchedule(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req struct {
		DayOfWeek    int    `json:"day_of_week" binding:"required"`
		IsWorkingDay bool   `json:"is_working_day"`
		StartTime    string `json:"start_time"`
		EndTime      string `json:"end_time"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.UpdateAgentSchedule(ctx, agentID.(int64), req.DayOfWeek, req.IsWorkingDay, req.StartTime, req.EndTime)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando horario"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Horario actualizado"})
}

// GetAgentBreaks obtiene las pausas del agente
func (h *SupportAgentDBHandler) GetAgentBreaks(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	breaks, err := h.repo.GetAgentBreaks(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo pausas"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"breaks": breaks})
}

// CreateAgentBreak crea una pausa
func (h *SupportAgentDBHandler) CreateAgentBreak(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req struct {
		Name      string `json:"name" binding:"required"`
		StartTime string `json:"start_time" binding:"required"`
		EndTime   string `json:"end_time" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	brk, err := h.repo.CreateAgentBreak(ctx, agentID.(int64), req.Name, req.StartTime, req.EndTime)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando pausa"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"break": brk, "message": "Pausa creada"})
}


// DeleteAgentBreak elimina una pausa
func (h *SupportAgentDBHandler) DeleteAgentBreak(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")
	breakID, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	err := h.repo.DeleteAgentBreak(ctx, breakID, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando pausa"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Pausa eliminada"})
}

// GetAgentVacations obtiene las vacaciones del agente
func (h *SupportAgentDBHandler) GetAgentVacations(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	vacations, err := h.repo.GetAgentVacations(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo vacaciones"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"vacations": vacations})
}

// CreateAgentVacation crea una solicitud de vacaciones
func (h *SupportAgentDBHandler) CreateAgentVacation(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req struct {
		StartDate string `json:"start_date" binding:"required"`
		EndDate   string `json:"end_date" binding:"required"`
		Reason    string `json:"reason"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	vacation, err := h.repo.CreateAgentVacation(ctx, agentID.(int64), req.StartDate, req.EndDate, req.Reason)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando solicitud"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"vacation": vacation, "message": "Solicitud creada"})
}

// ========== SLA POLICIES ==========

// GetSLAPolicies obtiene las políticas de SLA
func (h *SupportAgentDBHandler) GetSLAPolicies(c *gin.Context) {
	ctx := c.Request.Context()

	policies, err := h.repo.GetSLAPolicies(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo políticas"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"policies": policies})
}

// CreateSLAPolicy crea una política de SLA
func (h *SupportAgentDBHandler) CreateSLAPolicy(c *gin.Context) {
	ctx := c.Request.Context()

	var req struct {
		Name               string  `json:"name" binding:"required"`
		Category           *string `json:"category"`
		Priority           *string `json:"priority"`
		FirstResponseHours int     `json:"first_response_hours" binding:"required"`
		ResolutionHours    int     `json:"resolution_hours" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	policy, err := h.repo.CreateSLAPolicy(ctx, req.Name, req.Category, req.Priority, req.FirstResponseHours, req.ResolutionHours)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando política"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"policy": policy, "message": "Política creada"})
}


// UpdateSLAPolicy actualiza una política de SLA
func (h *SupportAgentDBHandler) UpdateSLAPolicy(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var req struct {
		Name               *string `json:"name"`
		FirstResponseHours *int    `json:"first_response_hours"`
		ResolutionHours    *int    `json:"resolution_hours"`
		IsActive           *bool   `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.UpdateSLAPolicy(ctx, id, req.Name, req.FirstResponseHours, req.ResolutionHours, req.IsActive)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando política"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Política actualizada"})
}

// ========== TICKET ATTACHMENTS ==========

// GetTicketAttachments obtiene los adjuntos de un ticket
func (h *SupportAgentDBHandler) GetTicketAttachments(c *gin.Context) {
	ctx := c.Request.Context()
	ticketID, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	attachments, err := h.repo.GetTicketAttachments(ctx, ticketID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo adjuntos"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"attachments": attachments})
}

// AddTicketAttachment agrega un adjunto a un ticket
func (h *SupportAgentDBHandler) AddTicketAttachment(c *gin.Context) {
	ctx := c.Request.Context()
	ticketID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	var req struct {
		FileName  string `json:"file_name" binding:"required"`
		FileURL   string `json:"file_url" binding:"required"`
		FileType  string `json:"file_type"`
		FileSize  int    `json:"file_size"`
		MessageID *int64 `json:"message_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	attachment, err := h.repo.AddTicketAttachment(ctx, ticketID, req.MessageID, req.FileName, req.FileURL, req.FileType, req.FileSize, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error agregando adjunto"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"attachment": attachment, "message": "Adjunto agregado"})
}

// DeleteTicketAttachment elimina un adjunto
func (h *SupportAgentDBHandler) DeleteTicketAttachment(c *gin.Context) {
	ctx := c.Request.Context()
	attachmentID, _ := strconv.ParseInt(c.Param("attachmentId"), 10, 64)

	err := h.repo.DeleteTicketAttachment(ctx, attachmentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando adjunto"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Adjunto eliminado"})
}


// ========== CHAT TRANSFERS ==========

// TransferChat transfiere un chat a otro agente
func (h *SupportAgentDBHandler) TransferChat(c *gin.Context) {
	ctx := c.Request.Context()
	chatID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	fromAgentID, _ := c.Get("userID")

	var req struct {
		ToAgentID int64  `json:"to_agent_id" binding:"required"`
		Reason    string `json:"reason"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	transfer, err := h.repo.TransferChat(ctx, chatID, fromAgentID.(int64), req.ToAgentID, req.Reason)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error transfiriendo chat"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"transfer": transfer, "message": "Transferencia solicitada"})
}

// AcceptChatTransfer acepta una transferencia de chat
func (h *SupportAgentDBHandler) AcceptChatTransfer(c *gin.Context) {
	ctx := c.Request.Context()
	transferID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	err := h.repo.AcceptChatTransfer(ctx, transferID, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error aceptando transferencia"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Transferencia aceptada"})
}

// GetPendingChatTransfers obtiene transferencias pendientes
func (h *SupportAgentDBHandler) GetPendingChatTransfers(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	transfers, err := h.repo.GetPendingChatTransfers(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo transferencias"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"transfers": transfers})
}

// ========== QUICK REPLIES ==========

// GetQuickReplies obtiene las respuestas rápidas
func (h *SupportAgentDBHandler) GetQuickReplies(c *gin.Context) {
	ctx := c.Request.Context()

	replies, err := h.repo.GetQuickReplies(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo respuestas"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"quick_replies": replies})
}

// CreateQuickReply crea una respuesta rápida
func (h *SupportAgentDBHandler) CreateQuickReply(c *gin.Context) {
	ctx := c.Request.Context()

	var req struct {
		Text         string `json:"text" binding:"required"`
		Category     string `json:"category"`
		DisplayOrder int    `json:"display_order"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	reply, err := h.repo.CreateQuickReply(ctx, req.Text, req.Category, req.DisplayOrder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando respuesta"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"quick_reply": reply, "message": "Respuesta creada"})
}

// DeleteQuickReply elimina una respuesta rápida
func (h *SupportAgentDBHandler) DeleteQuickReply(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	err := h.repo.DeleteQuickReply(ctx, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando respuesta"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Respuesta eliminada"})
}

// ========== TICKET CATEGORIES ==========

// GetTicketCategories obtiene las categorías de tickets
func (h *SupportAgentDBHandler) GetTicketCategories(c *gin.Context) {
	ctx := c.Request.Context()

	categories, err := h.repo.GetTicketCategories(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo categorías"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"categories": categories})
}


// ========== FAQ FEEDBACK ==========

// GetFAQFeedback obtiene el feedback de una FAQ
func (h *SupportAgentDBHandler) GetFAQFeedback(c *gin.Context) {
	ctx := c.Request.Context()
	faqID, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	feedback, err := h.repo.GetFAQFeedback(ctx, faqID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo feedback"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"feedback": feedback, "total": len(feedback)})
}

// AddFAQFeedback agrega feedback a una FAQ
func (h *SupportAgentDBHandler) AddFAQFeedback(c *gin.Context) {
	ctx := c.Request.Context()
	faqID, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var req struct {
		IsHelpful bool   `json:"is_helpful"`
		Comment   string `json:"comment"`
		UserID    *int64 `json:"user_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	feedback, err := h.repo.AddFAQFeedback(ctx, faqID, req.UserID, req.IsHelpful, req.Comment)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error agregando feedback"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"feedback": feedback, "message": "Feedback agregado"})
}

// ========== TICKET HISTORY ==========

// GetTicketHistory obtiene el historial de un ticket
func (h *SupportAgentDBHandler) GetTicketHistory(c *gin.Context) {
	ctx := c.Request.Context()
	ticketID, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	history, err := h.repo.GetTicketHistory(ctx, ticketID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo historial"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"history": history, "total": len(history)})
}

// ========== CHAT ATTACHMENTS ==========

// GetChatAttachments obtiene los adjuntos de un chat
func (h *SupportAgentDBHandler) GetChatAttachments(c *gin.Context) {
	ctx := c.Request.Context()
	chatID, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	attachments, err := h.repo.GetChatAttachments(ctx, chatID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo adjuntos"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"attachments": attachments, "total": len(attachments)})
}

// AddChatAttachment agrega un adjunto a un chat
func (h *SupportAgentDBHandler) AddChatAttachment(c *gin.Context) {
	ctx := c.Request.Context()
	chatID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	var req struct {
		FileName  string `json:"file_name" binding:"required"`
		FileURL   string `json:"file_url" binding:"required"`
		FileType  string `json:"file_type"`
		FileSize  int    `json:"file_size"`
		MessageID *int64 `json:"message_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	attachment, err := h.repo.AddChatAttachment(ctx, chatID, req.MessageID, req.FileName, req.FileURL, req.FileType, req.FileSize, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error agregando adjunto"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"attachment": attachment, "message": "Adjunto agregado"})
}

// DeleteChatAttachment elimina un adjunto de chat
func (h *SupportAgentDBHandler) DeleteChatAttachment(c *gin.Context) {
	ctx := c.Request.Context()
	attachmentID, _ := strconv.ParseInt(c.Param("attachmentId"), 10, 64)

	err := h.repo.DeleteChatAttachment(ctx, attachmentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando adjunto"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Adjunto eliminado"})
}


// ========== AGENT PERFORMANCE ==========

// GetAgentPerformance obtiene estadísticas de rendimiento
func (h *SupportAgentDBHandler) GetAgentPerformance(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")
	days, _ := strconv.Atoi(c.DefaultQuery("days", "30"))

	stats, err := h.repo.GetAgentPerformance(ctx, agentID.(int64), days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estadísticas"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"stats": stats, "days": days})
}

// GetTeamPerformance obtiene estadísticas del equipo
func (h *SupportAgentDBHandler) GetTeamPerformance(c *gin.Context) {
	ctx := c.Request.Context()
	days, _ := strconv.Atoi(c.DefaultQuery("days", "30"))

	stats, err := h.repo.GetTeamPerformance(ctx, days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estadísticas"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"stats": stats, "days": days})
}

// ========== SLA BREACHES ==========

// GetSLABreaches obtiene incumplimientos de SLA
func (h *SupportAgentDBHandler) GetSLABreaches(c *gin.Context) {
	ctx := c.Request.Context()
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	
	var acknowledged *bool
	if ack := c.Query("acknowledged"); ack != "" {
		val := ack == "true"
		acknowledged = &val
	}

	breaches, err := h.repo.GetSLABreaches(ctx, acknowledged, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo incumplimientos"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"breaches": breaches, "total": len(breaches)})
}

// AcknowledgeSLABreach reconoce un incumplimiento
func (h *SupportAgentDBHandler) AcknowledgeSLABreach(c *gin.Context) {
	ctx := c.Request.Context()
	breachID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	var req struct {
		Notes string `json:"notes"`
	}
	c.ShouldBindJSON(&req)

	err := h.repo.AcknowledgeSLABreach(ctx, breachID, agentID.(int64), req.Notes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reconociendo incumplimiento"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Incumplimiento reconocido"})
}

// GetUnacknowledgedBreachCount obtiene conteo de incumplimientos no reconocidos
func (h *SupportAgentDBHandler) GetUnacknowledgedBreachCount(c *gin.Context) {
	ctx := c.Request.Context()

	count, err := h.repo.GetUnacknowledgedBreachCount(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo conteo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"count": count})
}


// ========== ACTIVITY LOGS ==========

// GetActivityLogs obtiene logs de actividad
func (h *SupportAgentDBHandler) GetActivityLogs(c *gin.Context) {
	ctx := c.Request.Context()
	category := c.DefaultQuery("category", "all")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))
	
	var agentID *int64
	if aid := c.Query("agent_id"); aid != "" {
		id, _ := strconv.ParseInt(aid, 10, 64)
		agentID = &id
	}

	logs, err := h.repo.GetActivityLogs(ctx, agentID, category, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo logs"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"logs": logs, "total": len(logs)})
}

// GetMyActivityLogs obtiene logs del agente actual
func (h *SupportAgentDBHandler) GetMyActivityLogs(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")
	category := c.DefaultQuery("category", "all")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	aid := agentID.(int64)
	logs, err := h.repo.GetActivityLogs(ctx, &aid, category, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo logs"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"logs": logs, "total": len(logs)})
}

// ========== ANNOUNCEMENTS ==========

// GetAnnouncements obtiene anuncios activos
func (h *SupportAgentDBHandler) GetAnnouncements(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	announcements, err := h.repo.GetAnnouncements(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo anuncios"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"announcements": announcements, "total": len(announcements)})
}

// CreateAnnouncement crea un anuncio
func (h *SupportAgentDBHandler) CreateAnnouncement(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req struct {
		Title     string  `json:"title" binding:"required"`
		Content   string  `json:"content" binding:"required"`
		Type      string  `json:"type"`
		Priority  string  `json:"priority"`
		IsPinned  bool    `json:"is_pinned"`
		ExpiresAt *string `json:"expires_at"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Type == "" {
		req.Type = "info"
	}
	if req.Priority == "" {
		req.Priority = "medium"
	}

	var expiresAt *time.Time
	if req.ExpiresAt != nil {
		t, _ := time.Parse(time.RFC3339, *req.ExpiresAt)
		expiresAt = &t
	}

	announcement, err := h.repo.CreateAnnouncement(ctx, req.Title, req.Content, req.Type, req.Priority, req.IsPinned, agentID.(int64), expiresAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando anuncio"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"announcement": announcement, "message": "Anuncio creado"})
}

// MarkAnnouncementRead marca un anuncio como leído
func (h *SupportAgentDBHandler) MarkAnnouncementRead(c *gin.Context) {
	ctx := c.Request.Context()
	announcementID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	err := h.repo.MarkAnnouncementRead(ctx, announcementID, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error marcando anuncio"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Anuncio marcado como leído"})
}

// DeleteAnnouncement elimina un anuncio
func (h *SupportAgentDBHandler) DeleteAnnouncement(c *gin.Context) {
	ctx := c.Request.Context()
	announcementID, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	err := h.repo.DeleteAnnouncement(ctx, announcementID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando anuncio"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Anuncio eliminado"})
}


// ========== FAQ CATEGORIES ==========

// GetFAQCategories obtiene las categorías de FAQs
func (h *SupportAgentDBHandler) GetFAQCategories(c *gin.Context) {
	ctx := c.Request.Context()

	categories, err := h.repo.GetFAQCategories(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo categorías"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"categories": categories, "total": len(categories)})
}

// CreateFAQCategory crea una categoría de FAQ
func (h *SupportAgentDBHandler) CreateFAQCategory(c *gin.Context) {
	ctx := c.Request.Context()

	var req struct {
		Name         string `json:"name" binding:"required"`
		Slug         string `json:"slug"`
		Description  string `json:"description"`
		Icon         string `json:"icon"`
		DisplayOrder int    `json:"display_order"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category, err := h.repo.CreateFAQCategory(ctx, req.Name, req.Slug, req.Description, req.Icon, req.DisplayOrder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando categoría"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"category": category, "message": "Categoría creada"})
}

// UpdateFAQCategory actualiza una categoría de FAQ
func (h *SupportAgentDBHandler) UpdateFAQCategory(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var req struct {
		Name         *string `json:"name"`
		Description  *string `json:"description"`
		Icon         *string `json:"icon"`
		DisplayOrder *int    `json:"display_order"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.UpdateFAQCategory(ctx, id, req.Name, req.Description, req.Icon, req.DisplayOrder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando categoría"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Categoría actualizada"})
}

// DeleteFAQCategory elimina una categoría de FAQ
func (h *SupportAgentDBHandler) DeleteFAQCategory(c *gin.Context) {
	ctx := c.Request.Context()
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	err := h.repo.DeleteFAQCategory(ctx, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando categoría"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Categoría eliminada"})
}

// ========== INTERNAL CHAT ROOMS ==========

// GetChatRooms obtiene las salas de chat
func (h *SupportAgentDBHandler) GetChatRooms(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	rooms, err := h.repo.GetChatRooms(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo salas"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"rooms": rooms, "total": len(rooms)})
}

// CreateChatRoom crea una sala de chat
func (h *SupportAgentDBHandler) CreateChatRoom(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req struct {
		Name        string `json:"name" binding:"required"`
		Type        string `json:"type"`
		Description string `json:"description"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Type == "" {
		req.Type = "general"
	}

	room, err := h.repo.CreateChatRoom(ctx, req.Name, req.Type, req.Description, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando sala"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"room": room, "message": "Sala creada"})
}

// GetChatRoomMessages obtiene mensajes de una sala
func (h *SupportAgentDBHandler) GetChatRoomMessages(c *gin.Context) {
	ctx := c.Request.Context()
	roomID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	messages, err := h.repo.GetChatRoomMessages(ctx, roomID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo mensajes"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"messages": messages, "total": len(messages)})
}

// SendChatRoomMessage envía mensaje a una sala
func (h *SupportAgentDBHandler) SendChatRoomMessage(c *gin.Context) {
	ctx := c.Request.Context()
	roomID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	var req struct {
		Message string `json:"message" binding:"required"`
		ReplyTo *int64 `json:"reply_to"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	msg, err := h.repo.SendChatRoomMessage(ctx, roomID, agentID.(int64), req.Message, req.ReplyTo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error enviando mensaje"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": msg})
}

// JoinChatRoom une a un agente a una sala
func (h *SupportAgentDBHandler) JoinChatRoom(c *gin.Context) {
	ctx := c.Request.Context()
	roomID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	err := h.repo.JoinChatRoom(ctx, roomID, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error uniéndose a sala"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Unido a la sala"})
}

// LeaveChatRoom saca a un agente de una sala
func (h *SupportAgentDBHandler) LeaveChatRoom(c *gin.Context) {
	ctx := c.Request.Context()
	roomID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	err := h.repo.LeaveChatRoom(ctx, roomID, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saliendo de sala"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Salió de la sala"})
}

// ========== CHAT REACTIONS ==========

// AddReaction agrega una reacción
func (h *SupportAgentDBHandler) AddReaction(c *gin.Context) {
	ctx := c.Request.Context()
	messageID, _ := strconv.ParseInt(c.Param("messageId"), 10, 64)
	agentID, _ := c.Get("userID")

	var req struct {
		Emoji string `json:"emoji" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.AddReaction(ctx, messageID, agentID.(int64), req.Emoji)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error agregando reacción"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Reacción agregada"})
}

// RemoveReaction elimina una reacción
func (h *SupportAgentDBHandler) RemoveReaction(c *gin.Context) {
	ctx := c.Request.Context()
	messageID, _ := strconv.ParseInt(c.Param("messageId"), 10, 64)
	agentID, _ := c.Get("userID")
	emoji := c.Param("emoji")

	err := h.repo.RemoveReaction(ctx, messageID, agentID.(int64), emoji)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando reacción"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Reacción eliminada"})
}

// ========== MENTIONS ==========

// GetUnreadMentions obtiene menciones no leídas
func (h *SupportAgentDBHandler) GetUnreadMentions(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	count, err := h.repo.GetUnreadMentions(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo menciones"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"count": count})
}

// MarkMentionsRead marca menciones como leídas
func (h *SupportAgentDBHandler) MarkMentionsRead(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	err := h.repo.MarkMentionsRead(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error marcando menciones"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Menciones marcadas como leídas"})
}

// ========== AGENT SESSIONS ==========

// GetAgentSessions obtiene sesiones del agente
func (h *SupportAgentDBHandler) GetAgentSessions(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	sessions, err := h.repo.GetAgentSessions(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo sesiones"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"sessions": sessions, "total": len(sessions)})
}

// InvalidateAgentSession invalida una sesión
func (h *SupportAgentDBHandler) InvalidateAgentSession(c *gin.Context) {
	ctx := c.Request.Context()
	sessionID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	err := h.repo.InvalidateAgentSession(ctx, sessionID, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error invalidando sesión"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Sesión invalidada"})
}

// InvalidateAllAgentSessions invalida todas las sesiones
func (h *SupportAgentDBHandler) InvalidateAllAgentSessions(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	err := h.repo.InvalidateAllAgentSessions(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error invalidando sesiones"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Todas las sesiones invalidadas"})
}

// ========== LOGIN HISTORY ==========

// GetAgentLoginHistory obtiene historial de login
func (h *SupportAgentDBHandler) GetAgentLoginHistory(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	history, err := h.repo.GetAgentLoginHistory(ctx, agentID.(int64), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo historial"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"history": history, "total": len(history)})
}

// ========== API TOKENS ==========

// GetAPITokens obtiene tokens del agente
func (h *SupportAgentDBHandler) GetAPITokens(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	tokens, err := h.repo.GetAPITokens(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo tokens"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"tokens": tokens, "total": len(tokens)})
}

// CreateAPIToken crea un token
func (h *SupportAgentDBHandler) CreateAPIToken(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req struct {
		Name        string   `json:"name" binding:"required"`
		Permissions []string `json:"permissions"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generar token simple (en producción usar crypto/rand)
	tokenPrefix := "sk_" + strconv.FormatInt(agentID.(int64), 10)[:4]
	tokenHash := "hash_placeholder"

	token, err := h.repo.CreateAPIToken(ctx, agentID.(int64), req.Name, tokenHash, tokenPrefix, req.Permissions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando token"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"token": token, "message": "Token creado"})
}

// RevokeAPIToken revoca un token
func (h *SupportAgentDBHandler) RevokeAPIToken(c *gin.Context) {
	ctx := c.Request.Context()
	tokenID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	err := h.repo.RevokeAPIToken(ctx, tokenID, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error revocando token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Token revocado"})
}

// ========== WEBHOOKS ==========

// GetWebhooks obtiene webhooks
func (h *SupportAgentDBHandler) GetWebhooks(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	webhooks, err := h.repo.GetWebhooks(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo webhooks"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"webhooks": webhooks, "total": len(webhooks)})
}

// CreateWebhook crea un webhook
func (h *SupportAgentDBHandler) CreateWebhook(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req struct {
		URL    string   `json:"url" binding:"required"`
		Events []string `json:"events"`
		Secret string   `json:"secret"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	webhook, err := h.repo.CreateWebhook(ctx, agentID.(int64), req.URL, req.Events, req.Secret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando webhook"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"webhook": webhook, "message": "Webhook creado"})
}

// DeleteWebhook elimina un webhook
func (h *SupportAgentDBHandler) DeleteWebhook(c *gin.Context) {
	ctx := c.Request.Context()
	webhookID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	err := h.repo.DeleteWebhook(ctx, webhookID, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando webhook"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Webhook eliminado"})
}

// ========== GLOBAL SEARCH ==========

// GlobalSearch búsqueda global
func (h *SupportAgentDBHandler) GlobalSearch(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")
	query := c.Query("q")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query requerido"})
		return
	}

	results, err := h.repo.GlobalSearch(ctx, query, nil, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error en búsqueda"})
		return
	}

	// Guardar historial
	h.repo.SaveSearchHistory(ctx, agentID.(int64), query, len(results))

	c.JSON(http.StatusOK, gin.H{"results": results, "total": len(results), "query": query})
}

// ========== KEYBOARD SHORTCUTS ==========

// GetKeyboardShortcuts obtiene atajos
func (h *SupportAgentDBHandler) GetKeyboardShortcuts(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	shortcuts, err := h.repo.GetKeyboardShortcuts(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo atajos"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"shortcuts": shortcuts, "total": len(shortcuts)})
}

// UpdateKeyboardShortcut actualiza un atajo
func (h *SupportAgentDBHandler) UpdateKeyboardShortcut(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req struct {
		Action string `json:"action" binding:"required"`
		Keys   string `json:"keys" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.UpdateKeyboardShortcut(ctx, agentID.(int64), req.Action, req.Keys)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando atajo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Atajo actualizado"})
}

// ResetKeyboardShortcut resetea un atajo
func (h *SupportAgentDBHandler) ResetKeyboardShortcut(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")
	action := c.Param("action")

	err := h.repo.ResetKeyboardShortcut(ctx, agentID.(int64), action)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reseteando atajo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Atajo reseteado"})
}

// ========== VIDEO CALLS ==========

// GetVideoCalls obtiene videollamadas
func (h *SupportAgentDBHandler) GetVideoCalls(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")
	status := c.DefaultQuery("status", "all")

	calls, err := h.repo.GetVideoCalls(ctx, agentID.(int64), status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo videollamadas"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"calls": calls, "total": len(calls)})
}

// ScheduleVideoCall programa una videollamada
func (h *SupportAgentDBHandler) ScheduleVideoCall(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req struct {
		TicketID    *int64 `json:"ticket_id"`
		UserID      int64  `json:"user_id" binding:"required"`
		ScheduledAt string `json:"scheduled_at" binding:"required"`
		Duration    int    `json:"duration"`
		MeetingURL  string `json:"meeting_url"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	scheduledAt, _ := time.Parse(time.RFC3339, req.ScheduledAt)
	if req.Duration == 0 {
		req.Duration = 30
	}

	call, err := h.repo.ScheduleVideoCall(ctx, req.TicketID, req.UserID, agentID.(int64), scheduledAt, req.Duration, req.MeetingURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error programando videollamada"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"call": call, "message": "Videollamada programada"})
}

// UpdateVideoCallStatus actualiza estado de videollamada
func (h *SupportAgentDBHandler) UpdateVideoCallStatus(c *gin.Context) {
	ctx := c.Request.Context()
	callID, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.UpdateVideoCallStatus(ctx, callID, req.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando videollamada"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Estado actualizado"})
}

// ========== AI SUGGESTIONS ==========

// GetAISuggestions obtiene sugerencias de IA
func (h *SupportAgentDBHandler) GetAISuggestions(c *gin.Context) {
	ctx := c.Request.Context()
	ticketID, _ := strconv.ParseInt(c.Param("ticketId"), 10, 64)

	suggestions, err := h.repo.GetAISuggestions(ctx, ticketID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo sugerencias"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"suggestions": suggestions, "total": len(suggestions)})
}

// MarkAISuggestionUsed marca sugerencia como usada
func (h *SupportAgentDBHandler) MarkAISuggestionUsed(c *gin.Context) {
	ctx := c.Request.Context()
	suggestionID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	var req struct {
		WasModified bool `json:"was_modified"`
	}
	c.ShouldBindJSON(&req)

	err := h.repo.MarkAISuggestionUsed(ctx, suggestionID, agentID.(int64), req.WasModified)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error marcando sugerencia"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Sugerencia marcada como usada"})
}

// ========== ROLES & PERMISSIONS ==========

// GetSupportRoles obtiene roles
func (h *SupportAgentDBHandler) GetSupportRoles(c *gin.Context) {
	ctx := c.Request.Context()

	roles, err := h.repo.GetSupportRoles(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo roles"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"roles": roles, "total": len(roles)})
}

// GetAgentRoles obtiene roles del agente
func (h *SupportAgentDBHandler) GetAgentRoles(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	roles, err := h.repo.GetAgentRoles(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo roles"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"roles": roles, "total": len(roles)})
}

// AssignRole asigna un rol
func (h *SupportAgentDBHandler) AssignRole(c *gin.Context) {
	ctx := c.Request.Context()
	assignedBy, _ := c.Get("userID")

	var req struct {
		AgentID int64 `json:"agent_id" binding:"required"`
		RoleID  int64 `json:"role_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.AssignRole(ctx, req.AgentID, req.RoleID, assignedBy.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error asignando rol"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Rol asignado"})
}

// RemoveRole remueve un rol
func (h *SupportAgentDBHandler) RemoveRole(c *gin.Context) {
	ctx := c.Request.Context()

	var req struct {
		AgentID int64 `json:"agent_id" binding:"required"`
		RoleID  int64 `json:"role_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.RemoveRole(ctx, req.AgentID, req.RoleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error removiendo rol"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Rol removido"})
}

// GetSupportPermissions obtiene permisos
func (h *SupportAgentDBHandler) GetSupportPermissions(c *gin.Context) {
	ctx := c.Request.Context()

	perms, err := h.repo.GetSupportPermissions(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo permisos"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"permissions": perms, "total": len(perms)})
}

// ========== AUTO ASSIGNMENT RULES ==========

// GetAutoAssignmentRules obtiene reglas
func (h *SupportAgentDBHandler) GetAutoAssignmentRules(c *gin.Context) {
	ctx := c.Request.Context()

	rules, err := h.repo.GetAutoAssignmentRules(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo reglas"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"rules": rules, "total": len(rules)})
}

// CreateAutoAssignmentRule crea una regla
func (h *SupportAgentDBHandler) CreateAutoAssignmentRule(c *gin.Context) {
	ctx := c.Request.Context()

	var req struct {
		Name           string `json:"name" binding:"required"`
		Conditions     string `json:"conditions"`
		AssignmentType string `json:"assignment_type"`
		TargetAgents   string `json:"target_agents"`
		Priority       int    `json:"priority"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.AssignmentType == "" {
		req.AssignmentType = "round_robin"
	}

	rule, err := h.repo.CreateAutoAssignmentRule(ctx, req.Name, req.Conditions, req.AssignmentType, req.TargetAgents, req.Priority)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando regla"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"rule": rule, "message": "Regla creada"})
}

// ToggleAutoAssignmentRule activa/desactiva regla
func (h *SupportAgentDBHandler) ToggleAutoAssignmentRule(c *gin.Context) {
	ctx := c.Request.Context()
	ruleID, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	err := h.repo.ToggleAutoAssignmentRule(ctx, ruleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando regla"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Regla actualizada"})
}

// DeleteAutoAssignmentRule elimina regla
func (h *SupportAgentDBHandler) DeleteAutoAssignmentRule(c *gin.Context) {
	ctx := c.Request.Context()
	ruleID, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	err := h.repo.DeleteAutoAssignmentRule(ctx, ruleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando regla"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Regla eliminada"})
}

// GetAgentWorkload obtiene carga de trabajo
func (h *SupportAgentDBHandler) GetAgentWorkload(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	workload, err := h.repo.GetAgentWorkload(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo carga"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"workload": workload})
}

// UpdateAgentWorkload actualiza carga de trabajo
func (h *SupportAgentDBHandler) UpdateAgentWorkload(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req struct {
		MaxTickets     *int  `json:"max_tickets"`
		MaxChats       *int  `json:"max_chats"`
		IsAcceptingNew *bool `json:"is_accepting_new"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.UpdateAgentWorkload(ctx, agentID.(int64), req.MaxTickets, req.MaxChats, req.IsAcceptingNew)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando carga"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Carga actualizada"})
}

// ========== DATA EXPORTS ==========

// GetDataExports obtiene exportaciones
func (h *SupportAgentDBHandler) GetDataExports(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	exports, err := h.repo.GetDataExports(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo exportaciones"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"exports": exports, "total": len(exports)})
}

// CreateDataExport crea una exportación
func (h *SupportAgentDBHandler) CreateDataExport(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req struct {
		ExportType string `json:"export_type" binding:"required"`
		Filters    string `json:"filters"`
		Format     string `json:"format"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Format == "" {
		req.Format = "csv"
	}

	export, err := h.repo.CreateDataExport(ctx, agentID.(int64), req.ExportType, req.Filters, req.Format)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando exportación"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"export": export, "message": "Exportación en proceso"})
}

// ========== CSAT/NPS SURVEYS ==========

// GetCSATSurveys obtiene encuestas CSAT
func (h *SupportAgentDBHandler) GetCSATSurveys(c *gin.Context) {
	ctx := c.Request.Context()
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	var agentID *int64
	if aid := c.Query("agent_id"); aid != "" {
		id, _ := strconv.ParseInt(aid, 10, 64)
		agentID = &id
	}

	surveys, err := h.repo.GetCSATSurveys(ctx, agentID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo encuestas"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"surveys": surveys, "total": len(surveys)})
}

// GetNPSScores obtiene puntuaciones NPS
func (h *SupportAgentDBHandler) GetNPSScores(c *gin.Context) {
	ctx := c.Request.Context()
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	scores, err := h.repo.GetNPSScores(ctx, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo NPS"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"scores": scores, "total": len(scores)})
}

// GetNPSSummary obtiene resumen NPS
func (h *SupportAgentDBHandler) GetNPSSummary(c *gin.Context) {
	ctx := c.Request.Context()

	summary, err := h.repo.GetNPSSummary(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo resumen"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"summary": summary})
}

// ========== SAVED FILTERS ==========

// GetSavedFilters obtiene filtros guardados
func (h *SupportAgentDBHandler) GetSavedFilters(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	filters, err := h.repo.GetSavedFilters(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo filtros"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"filters": filters, "total": len(filters)})
}

// CreateSavedFilter crea un filtro
func (h *SupportAgentDBHandler) CreateSavedFilter(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req struct {
		Name      string `json:"name" binding:"required"`
		Filters   string `json:"filters" binding:"required"`
		IsDefault bool   `json:"is_default"`
		IsShared  bool   `json:"is_shared"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	filter, err := h.repo.CreateSavedFilter(ctx, agentID.(int64), req.Name, req.Filters, req.IsDefault, req.IsShared)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando filtro"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"filter": filter, "message": "Filtro guardado"})
}

// DeleteSavedFilter elimina un filtro
func (h *SupportAgentDBHandler) DeleteSavedFilter(c *gin.Context) {
	ctx := c.Request.Context()
	filterID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	err := h.repo.DeleteSavedFilter(ctx, filterID, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando filtro"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Filtro eliminado"})
}

// UseSavedFilter incrementa uso de filtro
func (h *SupportAgentDBHandler) UseSavedFilter(c *gin.Context) {
	ctx := c.Request.Context()
	filterID, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	err := h.repo.IncrementFilterUsage(ctx, filterID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando filtro"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Uso registrado"})
}

// ========== DASHBOARD WIDGETS ==========

// GetDashboardWidgets obtiene widgets
func (h *SupportAgentDBHandler) GetDashboardWidgets(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	widgets, err := h.repo.GetDashboardWidgets(ctx, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo widgets"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"widgets": widgets, "total": len(widgets)})
}

// SaveDashboardWidget guarda un widget
func (h *SupportAgentDBHandler) SaveDashboardWidget(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req struct {
		WidgetType string `json:"widget_type" binding:"required"`
		Title      string `json:"title"`
		PositionX  int    `json:"position_x"`
		PositionY  int    `json:"position_y"`
		Width      int    `json:"width"`
		Height     int    `json:"height"`
		Settings   string `json:"settings"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Width == 0 {
		req.Width = 1
	}
	if req.Height == 0 {
		req.Height = 1
	}

	widget, err := h.repo.SaveDashboardWidget(ctx, agentID.(int64), req.WidgetType, req.Title, req.PositionX, req.PositionY, req.Width, req.Height, req.Settings)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error guardando widget"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"widget": widget, "message": "Widget guardado"})
}

// UpdateDashboardWidget actualiza un widget
func (h *SupportAgentDBHandler) UpdateDashboardWidget(c *gin.Context) {
	ctx := c.Request.Context()
	widgetID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	var req struct {
		PositionX *int  `json:"position_x"`
		PositionY *int  `json:"position_y"`
		Width     *int  `json:"width"`
		Height    *int  `json:"height"`
		IsVisible *bool `json:"is_visible"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.UpdateDashboardWidget(ctx, widgetID, agentID.(int64), req.PositionX, req.PositionY, req.Width, req.Height, req.IsVisible)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando widget"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Widget actualizado"})
}

// DeleteDashboardWidget elimina un widget
func (h *SupportAgentDBHandler) DeleteDashboardWidget(c *gin.Context) {
	ctx := c.Request.Context()
	widgetID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	agentID, _ := c.Get("userID")

	err := h.repo.DeleteDashboardWidget(ctx, widgetID, agentID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando widget"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Widget eliminado"})
}

// ========== TYPING INDICATORS ==========

// SetTypingIndicator establece indicador de escritura
func (h *SupportAgentDBHandler) SetTypingIndicator(c *gin.Context) {
	ctx := c.Request.Context()
	agentID, _ := c.Get("userID")

	var req struct {
		ChatID   int64  `json:"chat_id" binding:"required"`
		ChatType string `json:"chat_type" binding:"required"`
		IsTyping bool   `json:"is_typing"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.SetTypingIndicator(ctx, req.ChatID, req.ChatType, agentID.(int64), req.IsTyping)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando indicador"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Indicador actualizado"})
}

// GetTypingIndicators obtiene indicadores de escritura
func (h *SupportAgentDBHandler) GetTypingIndicators(c *gin.Context) {
	ctx := c.Request.Context()
	chatID, _ := strconv.ParseInt(c.Query("chat_id"), 10, 64)
	chatType := c.Query("chat_type")

	userIDs, err := h.repo.GetTypingIndicators(ctx, chatID, chatType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo indicadores"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"typing_users": userIDs})
}
