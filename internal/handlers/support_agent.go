package handlers

import (
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// SupportAgentHandler maneja las operaciones del panel de agentes de soporte
type SupportAgentHandler struct {
	tickets      map[int64]*AgentTicket
	liveChats    map[int64]*AgentLiveChat
	faqs         map[int64]*AgentFAQ
	templates    map[int64]*AgentTemplate
	knowledge    map[int64]*AgentKnowledge
	users        map[int64]*AgentUserInfo
	mu           sync.RWMutex
	nextTicketID int64
	nextChatID   int64
	nextFaqID    int64
}

// AgentTicket representa un ticket para el agente
type AgentTicket struct {
	ID            int64           `json:"id"`
	OdID          string          `json:"od_id"`
	UserID        int64           `json:"user_id"`
	UserName      string          `json:"user_name"`
	UserEmail     string          `json:"user_email"`
	Subject       string          `json:"subject"`
	Category      string          `json:"category"`
	Status        string          `json:"status"`
	Priority      string          `json:"priority"`
	AssignedTo    *string         `json:"assigned_to"`
	EscalatedTo   *string         `json:"escalated_to"`
	Tags          []string        `json:"tags"`
	Language      string          `json:"language"`
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`
	SLADeadline   time.Time       `json:"sla_deadline"`
	Rating        *int            `json:"rating"`
	Messages      []AgentMessage  `json:"messages"`
	InternalNotes []InternalNote  `json:"internal_notes"`
	History       []TicketHistory `json:"history"`
}

// AgentMessage mensaje en ticket
type AgentMessage struct {
	ID        int64     `json:"id"`
	Sender    string    `json:"sender"`
	Name      string    `json:"sender_name"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
	IsRead    bool      `json:"is_read"`
}

// InternalNote nota interna
type InternalNote struct {
	ID        int64     `json:"id"`
	Author    string    `json:"author"`
	Note      string    `json:"note"`
	Timestamp time.Time `json:"timestamp"`
}

// TicketHistory historial del ticket
type TicketHistory struct {
	ID        int64     `json:"id"`
	Action    string    `json:"action"`
	By        string    `json:"by"`
	Timestamp time.Time `json:"timestamp"`
	Details   string    `json:"details"`
}

// AgentLiveChat chat en vivo para agente
type AgentLiveChat struct {
	ID          int64              `json:"id"`
	OdID        string             `json:"od_id"`
	UserID      int64              `json:"user_id"`
	UserName    string             `json:"user_name"`
	UserEmail   string             `json:"user_email"`
	Status      string             `json:"status"`
	AssignedTo  *string            `json:"assigned_to"`
	StartedAt   time.Time          `json:"started_at"`
	WaitingTime int                `json:"waiting_time"`
	Language    string             `json:"language"`
	Messages    []AgentChatMessage `json:"messages"`
	IsTyping    bool               `json:"is_typing"`
}

// AgentChatMessage mensaje de chat
type AgentChatMessage struct {
	ID        int64     `json:"id"`
	Sender    string    `json:"sender"`
	Name      string    `json:"sender_name"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}

// AgentFAQ FAQ para agente
type AgentFAQ struct {
	ID          int64     `json:"id"`
	Question    string    `json:"question"`
	Answer      string    `json:"answer"`
	Category    string    `json:"category"`
	Views       int       `json:"views"`
	Helpful     int       `json:"helpful"`
	NotHelpful  int       `json:"not_helpful"`
	IsPublished bool      `json:"is_published"`
	Order       int       `json:"order"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// AgentTemplate plantilla de respuesta
type AgentTemplate struct {
	ID         int64     `json:"id"`
	Name       string    `json:"name"`
	Shortcut   string    `json:"shortcut"`
	Category   string    `json:"category"`
	Content    string    `json:"content"`
	Variables  []string  `json:"variables"`
	UsageCount int       `json:"usage_count"`
	IsFavorite bool      `json:"is_favorite"`
	CreatedAt  time.Time `json:"created_at"`
}

// AgentKnowledge artículo de conocimiento
type AgentKnowledge struct {
	ID              int64     `json:"id"`
	Title           string    `json:"title"`
	Category        string    `json:"category"`
	Content         string    `json:"content"`
	Tags            []string  `json:"tags"`
	Author          string    `json:"author"`
	Views           int       `json:"views"`
	IsPublished     bool      `json:"is_published"`
	RelatedArticles []int64   `json:"related_articles"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// AgentUserInfo información de usuario para agente
type AgentUserInfo struct {
	ID               int64      `json:"id"`
	OdID             string     `json:"od_id"`
	Name             string     `json:"name"`
	Email            string     `json:"email"`
	Phone            string     `json:"phone"`
	Country          string     `json:"country"`
	Language         string     `json:"language"`
	Balance          float64    `json:"balance"`
	DemoBalance      float64    `json:"demo_balance"`
	TotalDeposits    float64    `json:"total_deposits"`
	TotalWithdrawals float64    `json:"total_withdrawals"`
	RegisteredAt     time.Time  `json:"registered_at"`
	LastLogin        time.Time  `json:"last_login"`
	Status           string     `json:"status"`
	Verified         bool       `json:"verified"`
	TicketCount      int        `json:"ticket_count"`
	AvgRating        float64    `json:"avg_rating"`
	RiskLevel        string     `json:"risk_level"`
	Notes            []UserNote `json:"notes"`
}

// UserNote nota de usuario
type UserNote struct {
	ID        int64     `json:"id"`
	Note      string    `json:"note"`
	Author    string    `json:"author"`
	CreatedAt time.Time `json:"created_at"`
}

// NewSupportAgentHandler crea un nuevo handler
func NewSupportAgentHandler() *SupportAgentHandler {
	h := &SupportAgentHandler{
		tickets:      make(map[int64]*AgentTicket),
		liveChats:    make(map[int64]*AgentLiveChat),
		faqs:         make(map[int64]*AgentFAQ),
		templates:    make(map[int64]*AgentTemplate),
		knowledge:    make(map[int64]*AgentKnowledge),
		users:        make(map[int64]*AgentUserInfo),
		nextTicketID: 1001,
		nextChatID:   1,
		nextFaqID:    1,
	}
	h.seedData()
	return h
}

// seedData carga datos iniciales
func (h *SupportAgentHandler) seedData() {
	// Seed tickets
	now := time.Now()
	agent := "Soporte Demo"

	h.tickets[1001] = &AgentTicket{
		ID: 1001, OdID: "OD-001234", UserID: 1, UserName: "Juan Pérez", UserEmail: "juan@email.com",
		Subject: "Problema con retiro pendiente", Category: "withdrawal", Status: "open", Priority: "urgent",
		AssignedTo: nil, Tags: []string{"retiro", "urgente"}, Language: "es",
		CreatedAt: now.Add(-2 * time.Hour), UpdatedAt: now.Add(-2 * time.Hour),
		SLADeadline: now.Add(2 * time.Hour),
		Messages: []AgentMessage{{ID: 1, Sender: "user", Name: "Juan Pérez", Message: "Mi retiro lleva 3 días pendiente", Timestamp: now.Add(-2 * time.Hour), IsRead: false}},
		InternalNotes: []InternalNote{}, History: []TicketHistory{{ID: 1, Action: "Ticket creado", By: "Sistema", Timestamp: now.Add(-2 * time.Hour), Details: ""}},
	}
	h.tickets[1002] = &AgentTicket{
		ID: 1002, OdID: "OD-001235", UserID: 2, UserName: "María García", UserEmail: "maria@email.com",
		Subject: "Verificación rechazada", Category: "verification", Status: "in_progress", Priority: "high",
		AssignedTo: &agent, Tags: []string{"kyc", "documentos"}, Language: "es",
		CreatedAt: now.Add(-3 * time.Hour), UpdatedAt: now.Add(-1 * time.Hour), SLADeadline: now.Add(1 * time.Hour),
		Messages: []AgentMessage{
			{ID: 1, Sender: "user", Name: "María García", Message: "Mis documentos fueron rechazados", Timestamp: now.Add(-3 * time.Hour), IsRead: true},
			{ID: 2, Sender: "support", Name: "Soporte Demo", Message: "Estamos revisando tu caso", Timestamp: now.Add(-1 * time.Hour), IsRead: true},
		},
		InternalNotes: []InternalNote{{ID: 1, Author: "Soporte Demo", Note: "Foto borrosa", Timestamp: now.Add(-1 * time.Hour)}},
		History:       []TicketHistory{},
	}

	// Seed live chats
	h.liveChats[1] = &AgentLiveChat{
		ID: 1, OdID: "OD-001240", UserID: 10, UserName: "Pedro Sánchez", UserEmail: "pedro@email.com",
		Status: "waiting", AssignedTo: nil, StartedAt: now.Add(-5 * time.Minute), WaitingTime: 5, Language: "es",
		Messages: []AgentChatMessage{{ID: 1, Sender: "user", Name: "Pedro Sánchez", Message: "Necesito ayuda urgente", Timestamp: now.Add(-5 * time.Minute)}},
		IsTyping: false,
	}
	h.liveChats[2] = &AgentLiveChat{
		ID: 2, OdID: "OD-001241", UserID: 11, UserName: "Laura Gómez", UserEmail: "laura@email.com",
		Status: "active", AssignedTo: &agent, StartedAt: now.Add(-10 * time.Minute), WaitingTime: 0, Language: "es",
		Messages: []AgentChatMessage{
			{ID: 1, Sender: "user", Name: "Laura Gómez", Message: "¿Cuánto tarda la verificación?", Timestamp: now.Add(-10 * time.Minute)},
			{ID: 2, Sender: "support", Name: "Soporte Demo", Message: "Normalmente 24-48 horas", Timestamp: now.Add(-8 * time.Minute)},
		},
		IsTyping: true,
	}

	// Seed FAQs
	h.faqs[1] = &AgentFAQ{ID: 1, Question: "¿Cómo verifico mi cuenta?", Answer: "Ve a Configuración > Verificación y sube tus documentos", Category: "Cuenta", Views: 1250, Helpful: 890, NotHelpful: 45, IsPublished: true, Order: 1, CreatedAt: now.Add(-30 * 24 * time.Hour), UpdatedAt: now}
	h.faqs[2] = &AgentFAQ{ID: 2, Question: "¿Cuánto tarda un retiro?", Answer: "Criptomonedas: 1-24h, Transferencia: 2-5 días", Category: "Retiros", Views: 980, Helpful: 756, NotHelpful: 32, IsPublished: true, Order: 1, CreatedAt: now.Add(-30 * 24 * time.Hour), UpdatedAt: now}
	h.faqs[3] = &AgentFAQ{ID: 3, Question: "¿Cómo funciona el trading?", Answer: "Selecciona activo, monto, dirección y tiempo", Category: "Trading", Views: 856, Helpful: 623, NotHelpful: 28, IsPublished: true, Order: 1, CreatedAt: now.Add(-30 * 24 * time.Hour), UpdatedAt: now}
	h.nextFaqID = 4

	// Seed templates
	h.templates[1] = &AgentTemplate{ID: 1, Name: "Saludo inicial", Shortcut: "/saludo", Category: "General", Content: "Hola {nombre}, gracias por contactarnos. ¿En qué puedo ayudarte?", Variables: []string{"nombre"}, UsageCount: 245, IsFavorite: true, CreatedAt: now}
	h.templates[2] = &AgentTemplate{ID: 2, Name: "Retiro en proceso", Shortcut: "/retiro", Category: "Retiros", Content: "Tu retiro por {monto} está siendo procesado.", Variables: []string{"monto"}, UsageCount: 189, IsFavorite: true, CreatedAt: now}
	h.templates[3] = &AgentTemplate{ID: 3, Name: "Verificación pendiente", Shortcut: "/verificacion", Category: "Cuenta", Content: "Tus documentos están siendo revisados (24-48h)", Variables: []string{}, UsageCount: 156, IsFavorite: false, CreatedAt: now}

	// Seed knowledge
	h.knowledge[1] = &AgentKnowledge{ID: 1, Title: "Guía KYC", Category: "Procesos", Content: "# Verificación KYC\n\nDocumentos aceptados: INE, Pasaporte, Licencia", Tags: []string{"kyc", "verificación"}, Author: "Admin", Views: 234, IsPublished: true, RelatedArticles: []int64{}, CreatedAt: now, UpdatedAt: now}
	h.knowledge[2] = &AgentKnowledge{ID: 2, Title: "Protocolo de retiros", Category: "Retiros", Content: "# Retiros\n\n1. Verificar estado\n2. Confirmar cuenta verificada", Tags: []string{"retiros", "protocolo"}, Author: "Admin", Views: 189, IsPublished: true, RelatedArticles: []int64{}, CreatedAt: now, UpdatedAt: now}

	// Seed users
	h.users[1] = &AgentUserInfo{ID: 1, OdID: "OD-001234", Name: "Juan Pérez", Email: "juan@email.com", Phone: "+52 555 123 4567", Country: "México", Language: "es", Balance: 5420, DemoBalance: 10000, TotalDeposits: 8000, TotalWithdrawals: 2500, RegisteredAt: now.Add(-60 * 24 * time.Hour), LastLogin: now, Status: "active", Verified: true, TicketCount: 3, AvgRating: 4.5, RiskLevel: "low", Notes: []UserNote{}}
	h.users[2] = &AgentUserInfo{ID: 2, OdID: "OD-001235", Name: "María García", Email: "maria@email.com", Phone: "+52 555 987 6543", Country: "Colombia", Language: "es", Balance: 12350, DemoBalance: 10000, TotalDeposits: 15000, TotalWithdrawals: 3000, RegisteredAt: now.Add(-90 * 24 * time.Hour), LastLogin: now, Status: "active", Verified: true, TicketCount: 1, AvgRating: 4.8, RiskLevel: "low", Notes: []UserNote{}}
}

// ========== TICKETS ==========

// GetAllTickets obtiene todos los tickets para el agente
func (h *SupportAgentHandler) GetAllTickets(c *gin.Context) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	status := c.DefaultQuery("status", "all")
	priority := c.DefaultQuery("priority", "all")
	category := c.DefaultQuery("category", "all")

	var result []*AgentTicket
	for _, t := range h.tickets {
		if status != "all" && t.Status != status {
			continue
		}
		if priority != "all" && t.Priority != priority {
			continue
		}
		if category != "all" && t.Category != category {
			continue
		}
		result = append(result, t)
	}

	c.JSON(http.StatusOK, gin.H{"tickets": result, "total": len(result)})
}

// GetTicketByID obtiene un ticket específico
func (h *SupportAgentHandler) GetTicketByID(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	h.mu.RLock()
	ticket, exists := h.tickets[id]
	h.mu.RUnlock()

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket no encontrado"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ticket": ticket})
}

// UpdateTicket actualiza un ticket
func (h *SupportAgentHandler) UpdateTicket(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var req struct {
		Status     *string  `json:"status"`
		Priority   *string  `json:"priority"`
		AssignedTo *string  `json:"assigned_to"`
		Tags       []string `json:"tags"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	ticket, exists := h.tickets[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket no encontrado"})
		return
	}

	if req.Status != nil {
		ticket.Status = *req.Status
	}
	if req.Priority != nil {
		ticket.Priority = *req.Priority
	}
	if req.AssignedTo != nil {
		ticket.AssignedTo = req.AssignedTo
	}
	if req.Tags != nil {
		ticket.Tags = req.Tags
	}
	ticket.UpdatedAt = time.Now()

	c.JSON(http.StatusOK, gin.H{"ticket": ticket, "message": "Ticket actualizado"})
}

// ReplyToTicket responde a un ticket
func (h *SupportAgentHandler) ReplyToTicket(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var req struct {
		Message string `json:"message" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	ticket, exists := h.tickets[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket no encontrado"})
		return
	}

	msg := AgentMessage{
		ID:        int64(len(ticket.Messages) + 1),
		Sender:    "support",
		Name:      "Soporte",
		Message:   req.Message,
		Timestamp: time.Now(),
		IsRead:    true,
	}
	ticket.Messages = append(ticket.Messages, msg)
	ticket.UpdatedAt = time.Now()

	c.JSON(http.StatusOK, gin.H{"message": msg, "ticket": ticket})
}

// AddInternalNote agrega nota interna
func (h *SupportAgentHandler) AddInternalNote(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var req struct {
		Note string `json:"note" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	ticket, exists := h.tickets[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket no encontrado"})
		return
	}

	note := InternalNote{
		ID:        int64(len(ticket.InternalNotes) + 1),
		Author:    "Soporte",
		Note:      req.Note,
		Timestamp: time.Now(),
	}
	ticket.InternalNotes = append(ticket.InternalNotes, note)

	c.JSON(http.StatusOK, gin.H{"note": note})
}

// EscalateTicket escala un ticket
func (h *SupportAgentHandler) EscalateTicket(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var req struct {
		EscalateTo string `json:"escalate_to" binding:"required"`
		Reason     string `json:"reason"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	ticket, exists := h.tickets[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket no encontrado"})
		return
	}

	ticket.Status = "escalated"
	ticket.EscalatedTo = &req.EscalateTo
	ticket.UpdatedAt = time.Now()
	ticket.History = append(ticket.History, TicketHistory{
		ID: int64(len(ticket.History) + 1), Action: "Escalado", By: "Soporte",
		Timestamp: time.Now(), Details: "Escalado a " + req.EscalateTo + ": " + req.Reason,
	})

	c.JSON(http.StatusOK, gin.H{"ticket": ticket, "message": "Ticket escalado"})
}

// ========== LIVE CHATS ==========

// GetLiveChats obtiene todos los chats en vivo
func (h *SupportAgentHandler) GetLiveChats(c *gin.Context) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	status := c.DefaultQuery("status", "all")
	var result []*AgentLiveChat
	for _, chat := range h.liveChats {
		if status != "all" && chat.Status != status {
			continue
		}
		result = append(result, chat)
	}

	waiting := 0
	active := 0
	for _, chat := range h.liveChats {
		if chat.Status == "waiting" {
			waiting++
		} else if chat.Status == "active" {
			active++
		}
	}

	c.JSON(http.StatusOK, gin.H{"chats": result, "waiting": waiting, "active": active})
}

// GetLiveChatByID obtiene un chat específico
func (h *SupportAgentHandler) GetLiveChatByID(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	h.mu.RLock()
	chat, exists := h.liveChats[id]
	h.mu.RUnlock()

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chat no encontrado"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"chat": chat})
}

// AcceptChat acepta un chat en espera
func (h *SupportAgentHandler) AcceptChat(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	h.mu.Lock()
	defer h.mu.Unlock()

	chat, exists := h.liveChats[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chat no encontrado"})
		return
	}

	agent := "Soporte"
	chat.Status = "active"
	chat.AssignedTo = &agent
	chat.WaitingTime = 0

	c.JSON(http.StatusOK, gin.H{"chat": chat, "message": "Chat aceptado"})
}

// SendChatMessage envía mensaje en chat
func (h *SupportAgentHandler) SendChatMessage(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var req struct {
		Message string `json:"message" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	chat, exists := h.liveChats[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chat no encontrado"})
		return
	}

	msg := AgentChatMessage{
		ID:        int64(len(chat.Messages) + 1),
		Sender:    "support",
		Name:      "Soporte",
		Message:   req.Message,
		Timestamp: time.Now(),
	}
	chat.Messages = append(chat.Messages, msg)

	c.JSON(http.StatusOK, gin.H{"message": msg, "chat": chat})
}

// EndChat termina un chat
func (h *SupportAgentHandler) EndLiveChat(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	h.mu.Lock()
	defer h.mu.Unlock()

	chat, exists := h.liveChats[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chat no encontrado"})
		return
	}

	chat.Status = "ended"
	c.JSON(http.StatusOK, gin.H{"chat": chat, "message": "Chat finalizado"})
}

// ========== FAQs ==========

// GetFAQs obtiene todas las FAQs
func (h *SupportAgentHandler) GetFAQs(c *gin.Context) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	category := c.DefaultQuery("category", "all")
	var result []*AgentFAQ
	for _, faq := range h.faqs {
		if category != "all" && faq.Category != category {
			continue
		}
		result = append(result, faq)
	}
	c.JSON(http.StatusOK, gin.H{"faqs": result})
}

// CreateFAQ crea una nueva FAQ
func (h *SupportAgentHandler) CreateFAQ(c *gin.Context) {
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

	h.mu.Lock()
	defer h.mu.Unlock()

	faq := &AgentFAQ{
		ID:          h.nextFaqID,
		Question:    req.Question,
		Answer:      req.Answer,
		Category:    req.Category,
		IsPublished: req.IsPublished,
		Views:       0,
		Helpful:     0,
		NotHelpful:  0,
		Order:       len(h.faqs) + 1,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	h.faqs[h.nextFaqID] = faq
	h.nextFaqID++

	c.JSON(http.StatusOK, gin.H{"faq": faq, "message": "FAQ creada"})
}

// UpdateFAQ actualiza una FAQ
func (h *SupportAgentHandler) UpdateFAQ(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var req struct {
		Question    *string `json:"question"`
		Answer      *string `json:"answer"`
		Category    *string `json:"category"`
		IsPublished *bool   `json:"is_published"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	faq, exists := h.faqs[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "FAQ no encontrada"})
		return
	}

	if req.Question != nil {
		faq.Question = *req.Question
	}
	if req.Answer != nil {
		faq.Answer = *req.Answer
	}
	if req.Category != nil {
		faq.Category = *req.Category
	}
	if req.IsPublished != nil {
		faq.IsPublished = *req.IsPublished
	}
	faq.UpdatedAt = time.Now()

	c.JSON(http.StatusOK, gin.H{"faq": faq, "message": "FAQ actualizada"})
}

// DeleteFAQ elimina una FAQ
func (h *SupportAgentHandler) DeleteFAQ(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	h.mu.Lock()
	defer h.mu.Unlock()

	if _, exists := h.faqs[id]; !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "FAQ no encontrada"})
		return
	}

	delete(h.faqs, id)
	c.JSON(http.StatusOK, gin.H{"message": "FAQ eliminada"})
}

// ========== TEMPLATES ==========

// GetTemplates obtiene todas las plantillas
func (h *SupportAgentHandler) GetTemplates(c *gin.Context) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	category := c.DefaultQuery("category", "all")
	var result []*AgentTemplate
	for _, t := range h.templates {
		if category != "all" && t.Category != category {
			continue
		}
		result = append(result, t)
	}
	c.JSON(http.StatusOK, gin.H{"templates": result})
}

// CreateTemplate crea una nueva plantilla
func (h *SupportAgentHandler) CreateTemplate(c *gin.Context) {
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

	h.mu.Lock()
	defer h.mu.Unlock()

	id := int64(len(h.templates) + 1)
	template := &AgentTemplate{
		ID:         id,
		Name:       req.Name,
		Shortcut:   req.Shortcut,
		Category:   req.Category,
		Content:    req.Content,
		Variables:  req.Variables,
		UsageCount: 0,
		IsFavorite: false,
		CreatedAt:  time.Now(),
	}
	h.templates[id] = template

	c.JSON(http.StatusOK, gin.H{"template": template, "message": "Plantilla creada"})
}

// ========== KNOWLEDGE BASE ==========

// GetKnowledgeArticles obtiene todos los artículos
func (h *SupportAgentHandler) GetKnowledgeArticles(c *gin.Context) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	category := c.DefaultQuery("category", "all")
	var result []*AgentKnowledge
	for _, k := range h.knowledge {
		if category != "all" && k.Category != category {
			continue
		}
		result = append(result, k)
	}
	c.JSON(http.StatusOK, gin.H{"articles": result})
}

// CreateKnowledgeArticle crea un nuevo artículo
func (h *SupportAgentHandler) CreateKnowledgeArticle(c *gin.Context) {
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

	h.mu.Lock()
	defer h.mu.Unlock()

	id := int64(len(h.knowledge) + 1)
	article := &AgentKnowledge{
		ID:              id,
		Title:           req.Title,
		Category:        req.Category,
		Content:         req.Content,
		Tags:            req.Tags,
		Author:          "Soporte",
		Views:           0,
		IsPublished:     req.IsPublished,
		RelatedArticles: []int64{},
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}
	h.knowledge[id] = article

	c.JSON(http.StatusOK, gin.H{"article": article, "message": "Artículo creado"})
}

// ========== USERS ==========

// GetUsers obtiene todos los usuarios
func (h *SupportAgentHandler) GetUsers(c *gin.Context) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	search := c.DefaultQuery("search", "")
	var result []*AgentUserInfo
	for _, u := range h.users {
		if search != "" {
			if !contains(u.Name, search) && !contains(u.Email, search) && !contains(u.OdID, search) {
				continue
			}
		}
		result = append(result, u)
	}
	c.JSON(http.StatusOK, gin.H{"users": result})
}

// GetUserByID obtiene un usuario específico
func (h *SupportAgentHandler) GetUserByID(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	h.mu.RLock()
	user, exists := h.users[id]
	h.mu.RUnlock()

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"user": user})
}

// AddUserNote agrega nota a usuario
func (h *SupportAgentHandler) AddUserNote(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var req struct {
		Note string `json:"note" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	user, exists := h.users[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}

	note := UserNote{
		ID:        int64(len(user.Notes) + 1),
		Note:      req.Note,
		Author:    "Soporte",
		CreatedAt: time.Now(),
	}
	user.Notes = append(user.Notes, note)

	c.JSON(http.StatusOK, gin.H{"note": note, "user": user})
}

// ========== DASHBOARD STATS ==========

// GetDashboardStats obtiene estadísticas del dashboard
func (h *SupportAgentHandler) GetDashboardStats(c *gin.Context) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	openTickets := 0
	urgentTickets := 0
	resolvedToday := 0
	waitingChats := 0
	activeChats := 0

	for _, t := range h.tickets {
		if t.Status == "open" || t.Status == "in_progress" || t.Status == "waiting" {
			openTickets++
		}
		if t.Priority == "urgent" && t.Status != "resolved" && t.Status != "closed" {
			urgentTickets++
		}
		if t.Status == "resolved" && t.UpdatedAt.Day() == time.Now().Day() {
			resolvedToday++
		}
	}

	for _, chat := range h.liveChats {
		if chat.Status == "waiting" {
			waitingChats++
		} else if chat.Status == "active" {
			activeChats++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"stats": gin.H{
			"open_tickets":    openTickets,
			"urgent_tickets":  urgentTickets,
			"resolved_today":  resolvedToday,
			"waiting_chats":   waitingChats,
			"active_chats":    activeChats,
			"total_tickets":   len(h.tickets),
			"total_users":     len(h.users),
			"total_faqs":      len(h.faqs),
			"total_templates": len(h.templates),
			"avg_response":    "< 5 min",
			"satisfaction":    "98%",
		},
	})
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(substr) == 0 ||
		(len(s) > 0 && len(substr) > 0 && findSubstring(s, substr)))
}

func findSubstring(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
