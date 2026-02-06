package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// SupportAgentRepository maneja las operaciones de BD para el panel de soporte
type SupportAgentRepository struct {
	pool *pgxpool.Pool
}

// NewSupportAgentRepository crea un nuevo repositorio
func NewSupportAgentRepository(pool *pgxpool.Pool) *SupportAgentRepository {
	return &SupportAgentRepository{pool: pool}
}

// ========== TICKETS ==========

// AgentTicket representa un ticket para el agente
type AgentTicket struct {
	ID            int64      `json:"id"`
	TicketNumber  string     `json:"ticket_number"`
	UserID        int64      `json:"user_id"`
	UserName      string     `json:"user_name"`
	UserEmail     string     `json:"user_email"`
	Subject       string     `json:"subject"`
	Description   string     `json:"description"`
	Category      string     `json:"category"`
	Priority      string     `json:"priority"`
	Status        string     `json:"status"`
	AssignedTo    *int64     `json:"assigned_to"`
	AssignedName  *string    `json:"assigned_name"`
	Tags          []string   `json:"tags"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
	ResolvedAt    *time.Time `json:"resolved_at"`
	Rating        *int       `json:"rating"`
}

// TicketMessage mensaje de ticket
type TicketMessage struct {
	ID         int64     `json:"id"`
	TicketID   int64     `json:"ticket_id"`
	SenderID   int64     `json:"sender_id"`
	SenderName string    `json:"sender_name"`
	SenderType string    `json:"sender_type"`
	Message    string    `json:"message"`
	IsInternal bool      `json:"is_internal"`
	CreatedAt  time.Time `json:"created_at"`
}

// GetAllTickets obtiene todos los tickets con filtros
func (r *SupportAgentRepository) GetAllTickets(ctx context.Context, status, priority, category string) ([]*AgentTicket, error) {
	query := `
		SELECT t.id, t.ticket_number, t.user_id, 
			COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			COALESCE(u.email, '') as user_email,
			t.subject, COALESCE(t.description, '') as description,
			COALESCE(c.name, 'General') as category,
			t.priority, t.status, t.assigned_to,
			COALESCE(a.first_name || ' ' || a.last_name, NULL) as assigned_name,
			COALESCE(t.tags, '{}') as tags,
			t.created_at, t.updated_at, t.resolved_at, t.satisfaction_rating
		FROM support_tickets t
		LEFT JOIN users u ON t.user_id = u.id
		LEFT JOIN users a ON t.assigned_to = a.id
		LEFT JOIN ticket_categories c ON t.category_id = c.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1

	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND t.status = $%d", argNum)
		args = append(args, status)
		argNum++
	}
	if priority != "" && priority != "all" {
		query += fmt.Sprintf(" AND t.priority = $%d", argNum)
		args = append(args, priority)
		argNum++
	}

	query += " ORDER BY t.created_at DESC LIMIT 100"

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tickets []*AgentTicket
	for rows.Next() {
		t := &AgentTicket{}
		err := rows.Scan(
			&t.ID, &t.TicketNumber, &t.UserID, &t.UserName, &t.UserEmail,
			&t.Subject, &t.Description, &t.Category, &t.Priority, &t.Status,
			&t.AssignedTo, &t.AssignedName, &t.Tags, &t.CreatedAt, &t.UpdatedAt,
			&t.ResolvedAt, &t.Rating,
		)
		if err != nil {
			return nil, err
		}
		tickets = append(tickets, t)
	}
	return tickets, nil
}

// GetTicketByID obtiene un ticket por ID con sus mensajes
func (r *SupportAgentRepository) GetTicketByID(ctx context.Context, id int64) (*AgentTicket, []*TicketMessage, error) {
	query := `
		SELECT t.id, t.ticket_number, t.user_id, 
			COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			COALESCE(u.email, '') as user_email,
			t.subject, COALESCE(t.description, '') as description,
			COALESCE(c.name, 'General') as category,
			t.priority, t.status, t.assigned_to,
			COALESCE(a.first_name || ' ' || a.last_name, NULL) as assigned_name,
			COALESCE(t.tags, '{}') as tags,
			t.created_at, t.updated_at, t.resolved_at, t.satisfaction_rating
		FROM support_tickets t
		LEFT JOIN users u ON t.user_id = u.id
		LEFT JOIN users a ON t.assigned_to = a.id
		LEFT JOIN ticket_categories c ON t.category_id = c.id
		WHERE t.id = $1
	`
	t := &AgentTicket{}
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&t.ID, &t.TicketNumber, &t.UserID, &t.UserName, &t.UserEmail,
		&t.Subject, &t.Description, &t.Category, &t.Priority, &t.Status,
		&t.AssignedTo, &t.AssignedName, &t.Tags, &t.CreatedAt, &t.UpdatedAt,
		&t.ResolvedAt, &t.Rating,
	)
	if err != nil {
		return nil, nil, err
	}

	// Obtener mensajes
	msgQuery := `
		SELECT m.id, m.ticket_id, m.sender_id, 
			COALESCE(u.first_name || ' ' || u.last_name, 'Sistema') as sender_name,
			m.sender_type, m.message, m.is_internal, m.created_at
		FROM ticket_messages m
		LEFT JOIN users u ON m.sender_id = u.id
		WHERE m.ticket_id = $1
		ORDER BY m.created_at ASC
	`
	rows, err := r.pool.Query(ctx, msgQuery, id)
	if err != nil {
		return t, nil, err
	}
	defer rows.Close()

	var messages []*TicketMessage
	for rows.Next() {
		m := &TicketMessage{}
		err := rows.Scan(&m.ID, &m.TicketID, &m.SenderID, &m.SenderName, &m.SenderType, &m.Message, &m.IsInternal, &m.CreatedAt)
		if err != nil {
			return t, nil, err
		}
		messages = append(messages, m)
	}
	return t, messages, nil
}

// UpdateTicket actualiza un ticket
func (r *SupportAgentRepository) UpdateTicket(ctx context.Context, id int64, status, priority *string, assignedTo *int64, tags []string) error {
	query := "UPDATE support_tickets SET updated_at = NOW()"
	args := []interface{}{}
	argNum := 1

	if status != nil {
		query += fmt.Sprintf(", status = $%d", argNum)
		args = append(args, *status)
		argNum++
		if *status == "resolved" {
			query += ", resolved_at = NOW()"
		}
	}
	if priority != nil {
		query += fmt.Sprintf(", priority = $%d", argNum)
		args = append(args, *priority)
		argNum++
	}
	if assignedTo != nil {
		query += fmt.Sprintf(", assigned_to = $%d, assigned_at = NOW()", argNum)
		args = append(args, *assignedTo)
		argNum++
	}
	if tags != nil {
		query += fmt.Sprintf(", tags = $%d", argNum)
		args = append(args, tags)
		argNum++
	}

	query += fmt.Sprintf(" WHERE id = $%d", argNum)
	args = append(args, id)

	_, err := r.pool.Exec(ctx, query, args...)
	return err
}

// AddTicketMessage agrega un mensaje a un ticket
func (r *SupportAgentRepository) AddTicketMessage(ctx context.Context, ticketID, senderID int64, senderType, message string, isInternal bool) (*TicketMessage, error) {
	query := `
		INSERT INTO ticket_messages (ticket_id, sender_id, sender_type, message, is_internal)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at
	`
	m := &TicketMessage{
		TicketID:   ticketID,
		SenderID:   senderID,
		SenderType: senderType,
		Message:    message,
		IsInternal: isInternal,
	}
	err := r.pool.QueryRow(ctx, query, ticketID, senderID, senderType, message, isInternal).Scan(&m.ID, &m.CreatedAt)
	if err != nil {
		return nil, err
	}

	// Actualizar timestamp del ticket
	r.pool.Exec(ctx, "UPDATE support_tickets SET updated_at = NOW() WHERE id = $1", ticketID)

	// Si es primera respuesta de soporte, actualizar first_response_at
	if senderType == "support" && !isInternal {
		r.pool.Exec(ctx, "UPDATE support_tickets SET first_response_at = NOW() WHERE id = $1 AND first_response_at IS NULL", ticketID)
	}

	return m, nil
}

// ========== LIVE CHATS ==========

// AgentLiveChat chat en vivo
type AgentLiveChat struct {
	ID        int64      `json:"id"`
	UserID    int64      `json:"user_id"`
	UserName  string     `json:"user_name"`
	UserEmail string     `json:"user_email"`
	AgentID   *int64     `json:"agent_id"`
	AgentName *string    `json:"agent_name"`
	Status    string     `json:"status"`
	StartedAt *time.Time `json:"started_at"`
	EndedAt   *time.Time `json:"ended_at"`
	CreatedAt time.Time  `json:"created_at"`
}

// LiveChatMessage mensaje de chat
type LiveChatMessage struct {
	ID         int64     `json:"id"`
	ChatID     int64     `json:"chat_id"`
	SenderID   int64     `json:"sender_id"`
	SenderName string    `json:"sender_name"`
	SenderType string    `json:"sender_type"`
	Message    string    `json:"message"`
	IsRead     bool      `json:"is_read"`
	CreatedAt  time.Time `json:"created_at"`
}

// GetLiveChats obtiene todos los chats en vivo
func (r *SupportAgentRepository) GetLiveChats(ctx context.Context, status string) ([]*AgentLiveChat, error) {
	query := `
		SELECT c.id, c.user_id,
			COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			COALESCE(u.email, '') as user_email,
			c.agent_id,
			COALESCE(a.first_name || ' ' || a.last_name, NULL) as agent_name,
			c.status, c.started_at, c.ended_at, c.created_at
		FROM live_chats c
		LEFT JOIN users u ON c.user_id = u.id
		LEFT JOIN users a ON c.agent_id = a.id
		WHERE 1=1
	`
	args := []interface{}{}
	if status != "" && status != "all" {
		query += " AND c.status = $1"
		args = append(args, status)
	}
	query += " ORDER BY c.created_at DESC LIMIT 50"

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var chats []*AgentLiveChat
	for rows.Next() {
		c := &AgentLiveChat{}
		err := rows.Scan(&c.ID, &c.UserID, &c.UserName, &c.UserEmail, &c.AgentID, &c.AgentName, &c.Status, &c.StartedAt, &c.EndedAt, &c.CreatedAt)
		if err != nil {
			return nil, err
		}
		chats = append(chats, c)
	}
	return chats, nil
}

// GetLiveChatMessages obtiene mensajes de un chat
func (r *SupportAgentRepository) GetLiveChatMessages(ctx context.Context, chatID int64) ([]*LiveChatMessage, error) {
	query := `
		SELECT m.id, m.chat_id, m.sender_id,
			COALESCE(u.first_name || ' ' || u.last_name, 'Sistema') as sender_name,
			m.sender_type, m.message, m.is_read, m.created_at
		FROM live_chat_messages m
		LEFT JOIN users u ON m.sender_id = u.id
		WHERE m.chat_id = $1
		ORDER BY m.created_at ASC
	`
	rows, err := r.pool.Query(ctx, query, chatID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*LiveChatMessage
	for rows.Next() {
		m := &LiveChatMessage{}
		err := rows.Scan(&m.ID, &m.ChatID, &m.SenderID, &m.SenderName, &m.SenderType, &m.Message, &m.IsRead, &m.CreatedAt)
		if err != nil {
			return nil, err
		}
		messages = append(messages, m)
	}
	return messages, nil
}

// AcceptChat acepta un chat
func (r *SupportAgentRepository) AcceptChat(ctx context.Context, chatID, agentID int64) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE live_chats SET agent_id = $1, status = 'active', started_at = NOW()
		WHERE id = $2
	`, agentID, chatID)
	return err
}

// AddChatMessage agrega mensaje a chat
func (r *SupportAgentRepository) AddChatMessage(ctx context.Context, chatID, senderID int64, senderType, message string) (*LiveChatMessage, error) {
	query := `
		INSERT INTO live_chat_messages (chat_id, sender_id, sender_type, message)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`
	m := &LiveChatMessage{ChatID: chatID, SenderID: senderID, SenderType: senderType, Message: message}
	err := r.pool.QueryRow(ctx, query, chatID, senderID, senderType, message).Scan(&m.ID, &m.CreatedAt)
	return m, err
}

// EndChat termina un chat
func (r *SupportAgentRepository) EndChat(ctx context.Context, chatID int64) error {
	_, err := r.pool.Exec(ctx, "UPDATE live_chats SET status = 'ended', ended_at = NOW() WHERE id = $1", chatID)
	return err
}

// ========== FAQs ==========

// AgentFAQ FAQ para agente
type AgentFAQ struct {
	ID          int64     `json:"id"`
	CategoryID  *int64    `json:"category_id"`
	Category    string    `json:"category"`
	Title       string    `json:"title"`
	Content     string    `json:"content"`
	Views       int       `json:"views"`
	Helpful     int       `json:"helpful"`
	NotHelpful  int       `json:"not_helpful"`
	IsPublished bool      `json:"is_published"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// GetFAQs obtiene todas las FAQs
func (r *SupportAgentRepository) GetFAQs(ctx context.Context, category string) ([]*AgentFAQ, error) {
	query := `
		SELECT f.id, f.category_id, COALESCE(c.name, 'General') as category,
			f.title, f.content, f.views, f.helpful_count, f.not_helpful_count,
			f.is_published, f.created_at, f.updated_at
		FROM faq_articles f
		LEFT JOIN faq_categories c ON f.category_id = c.id
		WHERE 1=1
	`
	args := []interface{}{}
	if category != "" && category != "all" {
		query += " AND c.name = $1"
		args = append(args, category)
	}
	query += " ORDER BY f.created_at DESC"

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var faqs []*AgentFAQ
	for rows.Next() {
		f := &AgentFAQ{}
		err := rows.Scan(&f.ID, &f.CategoryID, &f.Category, &f.Title, &f.Content, &f.Views, &f.Helpful, &f.NotHelpful, &f.IsPublished, &f.CreatedAt, &f.UpdatedAt)
		if err != nil {
			return nil, err
		}
		faqs = append(faqs, f)
	}
	return faqs, nil
}

// CreateFAQ crea una nueva FAQ
func (r *SupportAgentRepository) CreateFAQ(ctx context.Context, title, content, category string, isPublished bool) (*AgentFAQ, error) {
	// Buscar o crear categoría
	var categoryID *int64
	if category != "" {
		var cid int64
		err := r.pool.QueryRow(ctx, "SELECT id FROM faq_categories WHERE name = $1", category).Scan(&cid)
		if err != nil {
			// Crear categoría
			slug := fmt.Sprintf("%s-%d", category, time.Now().Unix())
			err = r.pool.QueryRow(ctx, "INSERT INTO faq_categories (name, slug) VALUES ($1, $2) RETURNING id", category, slug).Scan(&cid)
			if err != nil {
				return nil, err
			}
		}
		categoryID = &cid
	}

	slug := fmt.Sprintf("faq-%d", time.Now().UnixNano())
	query := `
		INSERT INTO faq_articles (category_id, title, slug, content, is_published)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`
	f := &AgentFAQ{CategoryID: categoryID, Category: category, Title: title, Content: content, IsPublished: isPublished}
	err := r.pool.QueryRow(ctx, query, categoryID, title, slug, content, isPublished).Scan(&f.ID, &f.CreatedAt, &f.UpdatedAt)
	return f, err
}

// UpdateFAQ actualiza una FAQ
func (r *SupportAgentRepository) UpdateFAQ(ctx context.Context, id int64, title, content *string, isPublished *bool) error {
	query := "UPDATE faq_articles SET updated_at = NOW()"
	args := []interface{}{}
	argNum := 1

	if title != nil {
		query += fmt.Sprintf(", title = $%d", argNum)
		args = append(args, *title)
		argNum++
	}
	if content != nil {
		query += fmt.Sprintf(", content = $%d", argNum)
		args = append(args, *content)
		argNum++
	}
	if isPublished != nil {
		query += fmt.Sprintf(", is_published = $%d", argNum)
		args = append(args, *isPublished)
		argNum++
	}

	query += fmt.Sprintf(" WHERE id = $%d", argNum)
	args = append(args, id)

	_, err := r.pool.Exec(ctx, query, args...)
	return err
}

// DeleteFAQ elimina una FAQ
func (r *SupportAgentRepository) DeleteFAQ(ctx context.Context, id int64) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM faq_articles WHERE id = $1", id)
	return err
}

// ========== TEMPLATES ==========

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
	UpdatedAt  time.Time `json:"updated_at"`
}

// GetTemplates obtiene todas las plantillas
func (r *SupportAgentRepository) GetTemplates(ctx context.Context, category string) ([]*AgentTemplate, error) {
	query := `
		SELECT id, name, shortcut, COALESCE(category, 'General') as category,
			content, COALESCE(variables, '{}') as variables,
			COALESCE(usage_count, 0) as usage_count, COALESCE(is_favorite, false) as is_favorite,
			created_at, updated_at
		FROM support_templates
		WHERE 1=1
	`
	args := []interface{}{}
	if category != "" && category != "all" {
		query += " AND category = $1"
		args = append(args, category)
	}
	query += " ORDER BY usage_count DESC, name ASC"

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var templates []*AgentTemplate
	for rows.Next() {
		t := &AgentTemplate{}
		err := rows.Scan(&t.ID, &t.Name, &t.Shortcut, &t.Category, &t.Content, &t.Variables, &t.UsageCount, &t.IsFavorite, &t.CreatedAt, &t.UpdatedAt)
		if err != nil {
			return nil, err
		}
		templates = append(templates, t)
	}
	return templates, nil
}

// CreateTemplate crea una nueva plantilla
func (r *SupportAgentRepository) CreateTemplate(ctx context.Context, name, shortcut, category, content string, variables []string) (*AgentTemplate, error) {
	if category == "" {
		category = "General"
	}
	if variables == nil {
		variables = []string{}
	}

	query := `
		INSERT INTO support_templates (name, shortcut, category, content, variables)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`
	t := &AgentTemplate{Name: name, Shortcut: shortcut, Category: category, Content: content, Variables: variables}
	err := r.pool.QueryRow(ctx, query, name, shortcut, category, content, variables).Scan(&t.ID, &t.CreatedAt, &t.UpdatedAt)
	return t, err
}

// UpdateTemplate actualiza una plantilla
func (r *SupportAgentRepository) UpdateTemplate(ctx context.Context, id int64, name, shortcut, category, content *string) error {
	query := "UPDATE support_templates SET updated_at = NOW()"
	args := []interface{}{}
	argNum := 1

	if name != nil {
		query += fmt.Sprintf(", name = $%d", argNum)
		args = append(args, *name)
		argNum++
	}
	if shortcut != nil {
		query += fmt.Sprintf(", shortcut = $%d", argNum)
		args = append(args, *shortcut)
		argNum++
	}
	if category != nil {
		query += fmt.Sprintf(", category = $%d", argNum)
		args = append(args, *category)
		argNum++
	}
	if content != nil {
		query += fmt.Sprintf(", content = $%d", argNum)
		args = append(args, *content)
		argNum++
	}

	query += fmt.Sprintf(" WHERE id = $%d", argNum)
	args = append(args, id)

	_, err := r.pool.Exec(ctx, query, args...)
	return err
}

// DeleteTemplate elimina una plantilla
func (r *SupportAgentRepository) DeleteTemplate(ctx context.Context, id int64) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM support_templates WHERE id = $1", id)
	return err
}

// ========== KNOWLEDGE BASE ==========

// AgentKnowledgeArticle artículo de conocimiento
type AgentKnowledgeArticle struct {
	ID          int64     `json:"id"`
	Title       string    `json:"title"`
	Category    string    `json:"category"`
	Content     string    `json:"content"`
	Tags        []string  `json:"tags"`
	AuthorID    int64     `json:"author_id"`
	AuthorName  string    `json:"author_name"`
	Views       int       `json:"views"`
	IsPublished bool      `json:"is_published"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// GetKnowledgeArticles obtiene todos los artículos
func (r *SupportAgentRepository) GetKnowledgeArticles(ctx context.Context, category string) ([]*AgentKnowledgeArticle, error) {
	query := `
		SELECT k.id, k.title, COALESCE(k.category, 'General') as category,
			k.content, COALESCE(k.tags, '{}') as tags,
			k.author_id, COALESCE(u.first_name || ' ' || u.last_name, 'Sistema') as author_name,
			COALESCE(k.views, 0) as views, k.is_published, k.created_at, k.updated_at
		FROM knowledge_articles k
		LEFT JOIN users u ON k.author_id = u.id
		WHERE 1=1
	`
	args := []interface{}{}
	if category != "" && category != "all" {
		query += " AND k.category = $1"
		args = append(args, category)
	}
	query += " ORDER BY k.views DESC, k.title ASC"

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var articles []*AgentKnowledgeArticle
	for rows.Next() {
		a := &AgentKnowledgeArticle{}
		err := rows.Scan(&a.ID, &a.Title, &a.Category, &a.Content, &a.Tags, &a.AuthorID, &a.AuthorName, &a.Views, &a.IsPublished, &a.CreatedAt, &a.UpdatedAt)
		if err != nil {
			return nil, err
		}
		articles = append(articles, a)
	}
	return articles, nil
}

// CreateKnowledgeArticle crea un nuevo artículo
func (r *SupportAgentRepository) CreateKnowledgeArticle(ctx context.Context, authorID int64, title, category, content string, tags []string, isPublished bool) (*AgentKnowledgeArticle, error) {
	if category == "" {
		category = "General"
	}
	if tags == nil {
		tags = []string{}
	}

	query := `
		INSERT INTO knowledge_articles (author_id, title, category, content, tags, is_published)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at
	`
	a := &AgentKnowledgeArticle{AuthorID: authorID, Title: title, Category: category, Content: content, Tags: tags, IsPublished: isPublished}
	err := r.pool.QueryRow(ctx, query, authorID, title, category, content, tags, isPublished).Scan(&a.ID, &a.CreatedAt, &a.UpdatedAt)
	return a, err
}

// UpdateKnowledgeArticle actualiza un artículo
func (r *SupportAgentRepository) UpdateKnowledgeArticle(ctx context.Context, id int64, title, category, content *string, tags []string, isPublished *bool) error {
	query := "UPDATE knowledge_articles SET updated_at = NOW()"
	args := []interface{}{}
	argNum := 1

	if title != nil {
		query += fmt.Sprintf(", title = $%d", argNum)
		args = append(args, *title)
		argNum++
	}
	if category != nil {
		query += fmt.Sprintf(", category = $%d", argNum)
		args = append(args, *category)
		argNum++
	}
	if content != nil {
		query += fmt.Sprintf(", content = $%d", argNum)
		args = append(args, *content)
		argNum++
	}
	if tags != nil {
		query += fmt.Sprintf(", tags = $%d", argNum)
		args = append(args, tags)
		argNum++
	}
	if isPublished != nil {
		query += fmt.Sprintf(", is_published = $%d", argNum)
		args = append(args, *isPublished)
		argNum++
	}

	query += fmt.Sprintf(" WHERE id = $%d", argNum)
	args = append(args, id)

	_, err := r.pool.Exec(ctx, query, args...)
	return err
}

// DeleteKnowledgeArticle elimina un artículo
func (r *SupportAgentRepository) DeleteKnowledgeArticle(ctx context.Context, id int64) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM knowledge_articles WHERE id = $1", id)
	return err
}

// ========== USER NOTES ==========

// AgentUserNote nota de usuario
type AgentUserNote struct {
	ID         int64     `json:"id"`
	UserID     int64     `json:"user_id"`
	AuthorID   int64     `json:"author_id"`
	AuthorName string    `json:"author_name"`
	Note       string    `json:"note"`
	CreatedAt  time.Time `json:"created_at"`
}

// GetUserNotes obtiene las notas de un usuario
func (r *SupportAgentRepository) GetUserNotes(ctx context.Context, userID int64) ([]*AgentUserNote, error) {
	query := `
		SELECT n.id, n.user_id, n.author_id,
			COALESCE(u.first_name || ' ' || u.last_name, 'Sistema') as author_name,
			n.note, n.created_at
		FROM user_notes n
		LEFT JOIN users u ON n.author_id = u.id
		WHERE n.user_id = $1
		ORDER BY n.created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notes []*AgentUserNote
	for rows.Next() {
		n := &AgentUserNote{}
		err := rows.Scan(&n.ID, &n.UserID, &n.AuthorID, &n.AuthorName, &n.Note, &n.CreatedAt)
		if err != nil {
			return nil, err
		}
		notes = append(notes, n)
	}
	return notes, nil
}

// AddUserNote agrega una nota a un usuario
func (r *SupportAgentRepository) AddUserNote(ctx context.Context, userID, authorID int64, note string) (*AgentUserNote, error) {
	query := `
		INSERT INTO user_notes (user_id, author_id, note)
		VALUES ($1, $2, $3)
		RETURNING id, created_at
	`
	n := &AgentUserNote{UserID: userID, AuthorID: authorID, Note: note}
	err := r.pool.QueryRow(ctx, query, userID, authorID, note).Scan(&n.ID, &n.CreatedAt)
	return n, err
}

// GetUserTickets obtiene los tickets de un usuario
func (r *SupportAgentRepository) GetUserTickets(ctx context.Context, userID int64) ([]*AgentTicket, error) {
	query := `
		SELECT t.id, t.ticket_number, t.user_id, 
			COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			COALESCE(u.email, '') as user_email,
			t.subject, COALESCE(t.description, '') as description,
			COALESCE(c.name, 'General') as category,
			t.priority, t.status, t.assigned_to,
			COALESCE(a.first_name || ' ' || a.last_name, NULL) as assigned_name,
			COALESCE(t.tags, '{}') as tags,
			t.created_at, t.updated_at, t.resolved_at, t.satisfaction_rating
		FROM support_tickets t
		LEFT JOIN users u ON t.user_id = u.id
		LEFT JOIN users a ON t.assigned_to = a.id
		LEFT JOIN ticket_categories c ON t.category_id = c.id
		WHERE t.user_id = $1
		ORDER BY t.created_at DESC
		LIMIT 50
	`
	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tickets []*AgentTicket
	for rows.Next() {
		t := &AgentTicket{}
		err := rows.Scan(
			&t.ID, &t.TicketNumber, &t.UserID, &t.UserName, &t.UserEmail,
			&t.Subject, &t.Description, &t.Category, &t.Priority, &t.Status,
			&t.AssignedTo, &t.AssignedName, &t.Tags, &t.CreatedAt, &t.UpdatedAt,
			&t.ResolvedAt, &t.Rating,
		)
		if err != nil {
			return nil, err
		}
		tickets = append(tickets, t)
	}
	return tickets, nil
}

// GetLiveChatByID obtiene un chat por ID
func (r *SupportAgentRepository) GetLiveChatByID(ctx context.Context, id int64) (*AgentLiveChat, error) {
	query := `
		SELECT c.id, c.user_id,
			COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			COALESCE(u.email, '') as user_email,
			c.agent_id,
			COALESCE(a.first_name || ' ' || a.last_name, NULL) as agent_name,
			c.status, c.started_at, c.ended_at, c.created_at
		FROM live_chats c
		LEFT JOIN users u ON c.user_id = u.id
		LEFT JOIN users a ON c.agent_id = a.id
		WHERE c.id = $1
	`
	c := &AgentLiveChat{}
	err := r.pool.QueryRow(ctx, query, id).Scan(&c.ID, &c.UserID, &c.UserName, &c.UserEmail, &c.AgentID, &c.AgentName, &c.Status, &c.StartedAt, &c.EndedAt, &c.CreatedAt)
	return c, err
}

// ========== USERS ==========

// AgentUserInfo información de usuario
type AgentUserInfo struct {
	ID               int64     `json:"id"`
	Email            string    `json:"email"`
	FirstName        string    `json:"first_name"`
	LastName         string    `json:"last_name"`
	Phone            *string   `json:"phone"`
	Country          *string   `json:"country"`
	Balance          float64   `json:"balance"`
	DemoBalance      float64   `json:"demo_balance"`
	IsVerified       bool      `json:"is_verified"`
	Status           string    `json:"status"`
	TotalDeposits    float64   `json:"total_deposits"`
	TotalWithdrawals float64   `json:"total_withdrawals"`
	TicketCount      int       `json:"ticket_count"`
	CreatedAt        time.Time `json:"created_at"`
	LastLogin        *time.Time `json:"last_login"`
}

// GetUsers obtiene usuarios
func (r *SupportAgentRepository) GetUsers(ctx context.Context, search string) ([]*AgentUserInfo, error) {
	query := `
		SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.country,
			u.balance, u.demo_balance, u.is_verified, 
			CASE WHEN u.is_active THEN 'active' ELSE 'inactive' END as status,
			COALESCE(u.total_deposits, 0) as total_deposits,
			COALESCE(u.total_withdrawals, 0) as total_withdrawals,
			(SELECT COUNT(*) FROM support_tickets WHERE user_id = u.id) as ticket_count,
			u.created_at, u.last_login
		FROM users u
		WHERE u.role = 'user'
	`
	args := []interface{}{}
	if search != "" {
		query += " AND (u.email ILIKE $1 OR u.first_name ILIKE $1 OR u.last_name ILIKE $1)"
		args = append(args, "%"+search+"%")
	}
	query += " ORDER BY u.created_at DESC LIMIT 100"

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*AgentUserInfo
	for rows.Next() {
		u := &AgentUserInfo{}
		err := rows.Scan(&u.ID, &u.Email, &u.FirstName, &u.LastName, &u.Phone, &u.Country,
			&u.Balance, &u.DemoBalance, &u.IsVerified, &u.Status,
			&u.TotalDeposits, &u.TotalWithdrawals, &u.TicketCount, &u.CreatedAt, &u.LastLogin)
		if err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}

// GetUserByID obtiene un usuario por ID
func (r *SupportAgentRepository) GetUserByID(ctx context.Context, id int64) (*AgentUserInfo, error) {
	query := `
		SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.country,
			u.balance, u.demo_balance, u.is_verified,
			CASE WHEN u.is_active THEN 'active' ELSE 'inactive' END as status,
			COALESCE(u.total_deposits, 0) as total_deposits,
			COALESCE(u.total_withdrawals, 0) as total_withdrawals,
			(SELECT COUNT(*) FROM support_tickets WHERE user_id = u.id) as ticket_count,
			u.created_at, u.last_login
		FROM users u
		WHERE u.id = $1
	`
	u := &AgentUserInfo{}
	err := r.pool.QueryRow(ctx, query, id).Scan(&u.ID, &u.Email, &u.FirstName, &u.LastName, &u.Phone, &u.Country,
		&u.Balance, &u.DemoBalance, &u.IsVerified, &u.Status,
		&u.TotalDeposits, &u.TotalWithdrawals, &u.TicketCount, &u.CreatedAt, &u.LastLogin)
	return u, err
}

// ========== DASHBOARD STATS ==========

// DashboardStats estadísticas del dashboard
type DashboardStats struct {
	OpenTickets    int `json:"open_tickets"`
	UrgentTickets  int `json:"urgent_tickets"`
	ResolvedToday  int `json:"resolved_today"`
	WaitingChats   int `json:"waiting_chats"`
	ActiveChats    int `json:"active_chats"`
	TotalTickets   int `json:"total_tickets"`
	TotalUsers     int `json:"total_users"`
	TotalFAQs      int `json:"total_faqs"`
	AvgResponseMin int `json:"avg_response_minutes"`
}

// GetDashboardStats obtiene estadísticas
func (r *SupportAgentRepository) GetDashboardStats(ctx context.Context) (*DashboardStats, error) {
	stats := &DashboardStats{}

	// Tickets abiertos
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM support_tickets WHERE status IN ('open', 'in_progress', 'waiting')").Scan(&stats.OpenTickets)

	// Tickets urgentes
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM support_tickets WHERE priority = 'urgent' AND status NOT IN ('resolved', 'closed')").Scan(&stats.UrgentTickets)

	// Resueltos hoy
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM support_tickets WHERE status = 'resolved' AND resolved_at::date = CURRENT_DATE").Scan(&stats.ResolvedToday)

	// Chats en espera
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM live_chats WHERE status = 'waiting'").Scan(&stats.WaitingChats)

	// Chats activos
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM live_chats WHERE status = 'active'").Scan(&stats.ActiveChats)

	// Total tickets
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM support_tickets").Scan(&stats.TotalTickets)

	// Total usuarios
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM users WHERE role = 'user'").Scan(&stats.TotalUsers)

	// Total FAQs
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM faq_articles WHERE is_published = true").Scan(&stats.TotalFAQs)

	// Tiempo promedio de respuesta (en minutos)
	r.pool.QueryRow(ctx, `
		SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (first_response_at - created_at))/60)::int, 15)
		FROM support_tickets WHERE first_response_at IS NOT NULL
	`).Scan(&stats.AvgResponseMin)

	return stats, nil
}


// ========== AGENT NOTIFICATIONS ==========

// AgentNotification notificación para agente
type AgentNotification struct {
	ID              int64      `json:"id"`
	AgentID         int64      `json:"agent_id"`
	NotificationType string    `json:"type"`
	Title           string     `json:"title"`
	Message         string     `json:"message"`
	Link            *string    `json:"link"`
	ReferenceType   *string    `json:"reference_type"`
	ReferenceID     *int64     `json:"reference_id"`
	IsRead          bool       `json:"is_read"`
	ReadAt          *time.Time `json:"read_at"`
	CreatedAt       time.Time  `json:"created_at"`
}

// GetAgentNotifications obtiene notificaciones de un agente
func (r *SupportAgentRepository) GetAgentNotifications(ctx context.Context, agentID int64, unreadOnly bool) ([]*AgentNotification, error) {
	query := `
		SELECT id, agent_id, notification_type, title, COALESCE(message, '') as message,
			link, reference_type, reference_id, is_read, read_at, created_at
		FROM agent_notifications
		WHERE agent_id = $1
	`
	if unreadOnly {
		query += " AND is_read = false"
	}
	query += " ORDER BY created_at DESC LIMIT 50"

	rows, err := r.pool.Query(ctx, query, agentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []*AgentNotification
	for rows.Next() {
		n := &AgentNotification{}
		err := rows.Scan(&n.ID, &n.AgentID, &n.NotificationType, &n.Title, &n.Message,
			&n.Link, &n.ReferenceType, &n.ReferenceID, &n.IsRead, &n.ReadAt, &n.CreatedAt)
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, n)
	}
	return notifications, nil
}

// GetUnreadNotificationCount obtiene el conteo de notificaciones no leídas
func (r *SupportAgentRepository) GetUnreadNotificationCount(ctx context.Context, agentID int64) (int, error) {
	var count int
	err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM agent_notifications WHERE agent_id = $1 AND is_read = false", agentID).Scan(&count)
	return count, err
}

// CreateAgentNotification crea una notificación
func (r *SupportAgentRepository) CreateAgentNotification(ctx context.Context, agentID int64, notifType, title, message string, link *string, refType *string, refID *int64) (*AgentNotification, error) {
	query := `
		INSERT INTO agent_notifications (agent_id, notification_type, title, message, link, reference_type, reference_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at
	`
	n := &AgentNotification{
		AgentID:          agentID,
		NotificationType: notifType,
		Title:            title,
		Message:          message,
		Link:             link,
		ReferenceType:    refType,
		ReferenceID:      refID,
		IsRead:           false,
	}
	err := r.pool.QueryRow(ctx, query, agentID, notifType, title, message, link, refType, refID).Scan(&n.ID, &n.CreatedAt)
	return n, err
}

// MarkNotificationRead marca una notificación como leída
func (r *SupportAgentRepository) MarkNotificationRead(ctx context.Context, notifID, agentID int64) error {
	_, err := r.pool.Exec(ctx, "UPDATE agent_notifications SET is_read = true, read_at = NOW() WHERE id = $1 AND agent_id = $2", notifID, agentID)
	return err
}

// MarkAllNotificationsRead marca todas las notificaciones como leídas
func (r *SupportAgentRepository) MarkAllNotificationsRead(ctx context.Context, agentID int64) error {
	_, err := r.pool.Exec(ctx, "UPDATE agent_notifications SET is_read = true, read_at = NOW() WHERE agent_id = $1 AND is_read = false", agentID)
	return err
}

// DeleteNotification elimina una notificación
func (r *SupportAgentRepository) DeleteNotification(ctx context.Context, notifID, agentID int64) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM agent_notifications WHERE id = $1 AND agent_id = $2", notifID, agentID)
	return err
}

// ========== CANNED RESPONSES ==========

// CannedResponse respuesta rápida
type CannedResponse struct {
	ID         int64     `json:"id"`
	Shortcut   string    `json:"shortcut"`
	Title      string    `json:"title"`
	Content    string    `json:"content"`
	Category   string    `json:"category"`
	CreatedBy  *int64    `json:"created_by"`
	IsGlobal   bool      `json:"is_global"`
	UsageCount int       `json:"usage_count"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// GetCannedResponses obtiene respuestas rápidas
func (r *SupportAgentRepository) GetCannedResponses(ctx context.Context, category string) ([]*CannedResponse, error) {
	query := `
		SELECT id, shortcut, title, content, COALESCE(category, 'General') as category,
			created_by, is_global, COALESCE(usage_count, 0) as usage_count, created_at, updated_at
		FROM canned_responses
		WHERE 1=1
	`
	args := []interface{}{}
	if category != "" && category != "all" {
		query += " AND category = $1"
		args = append(args, category)
	}
	query += " ORDER BY usage_count DESC, title ASC"

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var responses []*CannedResponse
	for rows.Next() {
		c := &CannedResponse{}
		err := rows.Scan(&c.ID, &c.Shortcut, &c.Title, &c.Content, &c.Category,
			&c.CreatedBy, &c.IsGlobal, &c.UsageCount, &c.CreatedAt, &c.UpdatedAt)
		if err != nil {
			return nil, err
		}
		responses = append(responses, c)
	}
	return responses, nil
}

// CreateCannedResponse crea una respuesta rápida
func (r *SupportAgentRepository) CreateCannedResponse(ctx context.Context, shortcut, title, content, category string, createdBy int64) (*CannedResponse, error) {
	if category == "" {
		category = "General"
	}
	query := `
		INSERT INTO canned_responses (shortcut, title, content, category, created_by)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`
	c := &CannedResponse{Shortcut: shortcut, Title: title, Content: content, Category: category, CreatedBy: &createdBy, IsGlobal: true}
	err := r.pool.QueryRow(ctx, query, shortcut, title, content, category, createdBy).Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)
	return c, err
}

// UpdateCannedResponse actualiza una respuesta rápida
func (r *SupportAgentRepository) UpdateCannedResponse(ctx context.Context, id int64, shortcut, title, content, category *string) error {
	query := "UPDATE canned_responses SET updated_at = NOW()"
	args := []interface{}{}
	argNum := 1

	if shortcut != nil {
		query += fmt.Sprintf(", shortcut = $%d", argNum)
		args = append(args, *shortcut)
		argNum++
	}
	if title != nil {
		query += fmt.Sprintf(", title = $%d", argNum)
		args = append(args, *title)
		argNum++
	}
	if content != nil {
		query += fmt.Sprintf(", content = $%d", argNum)
		args = append(args, *content)
		argNum++
	}
	if category != nil {
		query += fmt.Sprintf(", category = $%d", argNum)
		args = append(args, *category)
		argNum++
	}

	query += fmt.Sprintf(" WHERE id = $%d", argNum)
	args = append(args, id)

	_, err := r.pool.Exec(ctx, query, args...)
	return err
}

// DeleteCannedResponse elimina una respuesta rápida
func (r *SupportAgentRepository) DeleteCannedResponse(ctx context.Context, id int64) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM canned_responses WHERE id = $1", id)
	return err
}

// IncrementCannedResponseUsage incrementa el contador de uso
func (r *SupportAgentRepository) IncrementCannedResponseUsage(ctx context.Context, id int64) error {
	_, err := r.pool.Exec(ctx, "UPDATE canned_responses SET usage_count = usage_count + 1 WHERE id = $1", id)
	return err
}

// ========== MACROS ==========

// SupportMacro macro de soporte
type SupportMacro struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Actions     string    `json:"actions"` // JSON string
	CreatedBy   *int64    `json:"created_by"`
	IsGlobal    bool      `json:"is_global"`
	UsageCount  int       `json:"usage_count"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// GetMacros obtiene macros
func (r *SupportAgentRepository) GetMacros(ctx context.Context) ([]*SupportMacro, error) {
	query := `
		SELECT id, name, COALESCE(description, '') as description, actions::text,
			created_by, is_global, COALESCE(usage_count, 0) as usage_count, created_at, updated_at
		FROM support_macros
		ORDER BY usage_count DESC, name ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var macros []*SupportMacro
	for rows.Next() {
		m := &SupportMacro{}
		err := rows.Scan(&m.ID, &m.Name, &m.Description, &m.Actions,
			&m.CreatedBy, &m.IsGlobal, &m.UsageCount, &m.CreatedAt, &m.UpdatedAt)
		if err != nil {
			return nil, err
		}
		macros = append(macros, m)
	}
	return macros, nil
}

// CreateMacro crea un macro
func (r *SupportAgentRepository) CreateMacro(ctx context.Context, name, description, actions string, createdBy int64) (*SupportMacro, error) {
	query := `
		INSERT INTO support_macros (name, description, actions, created_by)
		VALUES ($1, $2, $3::jsonb, $4)
		RETURNING id, created_at, updated_at
	`
	m := &SupportMacro{Name: name, Description: description, Actions: actions, CreatedBy: &createdBy, IsGlobal: true}
	err := r.pool.QueryRow(ctx, query, name, description, actions, createdBy).Scan(&m.ID, &m.CreatedAt, &m.UpdatedAt)
	return m, err
}

// UpdateMacro actualiza un macro
func (r *SupportAgentRepository) UpdateMacro(ctx context.Context, id int64, name, description, actions *string) error {
	query := "UPDATE support_macros SET updated_at = NOW()"
	args := []interface{}{}
	argNum := 1

	if name != nil {
		query += fmt.Sprintf(", name = $%d", argNum)
		args = append(args, *name)
		argNum++
	}
	if description != nil {
		query += fmt.Sprintf(", description = $%d", argNum)
		args = append(args, *description)
		argNum++
	}
	if actions != nil {
		query += fmt.Sprintf(", actions = $%d::jsonb", argNum)
		args = append(args, *actions)
		argNum++
	}

	query += fmt.Sprintf(" WHERE id = $%d", argNum)
	args = append(args, id)

	_, err := r.pool.Exec(ctx, query, args...)
	return err
}

// DeleteMacro elimina un macro
func (r *SupportAgentRepository) DeleteMacro(ctx context.Context, id int64) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM support_macros WHERE id = $1", id)
	return err
}

// ========== AGENT STATUS ==========

// AgentStatusInfo estado del agente
type AgentStatusInfo struct {
	ID                  int64      `json:"id"`
	AgentID             int64      `json:"agent_id"`
	AgentName           string     `json:"agent_name"`
	Status              string     `json:"status"`
	StatusMessage       string     `json:"status_message"`
	MaxConcurrentChats  int        `json:"max_concurrent_chats"`
	MaxConcurrentTickets int       `json:"max_concurrent_tickets"`
	CurrentChats        int        `json:"current_chats"`
	CurrentTickets      int        `json:"current_tickets"`
	LastActivity        time.Time  `json:"last_activity"`
	UpdatedAt           time.Time  `json:"updated_at"`
}

// GetAgents obtiene lista de agentes con su estado
func (r *SupportAgentRepository) GetAgents(ctx context.Context) ([]*AgentStatusInfo, error) {
	query := `
		SELECT COALESCE(s.id, 0), u.id as agent_id,
			COALESCE(u.first_name || ' ' || u.last_name, u.email) as agent_name,
			COALESCE(s.status, 'available') as status,
			COALESCE(s.status_message, '') as status_message,
			COALESCE(s.max_concurrent_chats, 3) as max_concurrent_chats,
			COALESCE(s.max_concurrent_tickets, 10) as max_concurrent_tickets,
			COALESCE(s.current_chats, 0) as current_chats,
			COALESCE(s.current_tickets, 0) as current_tickets,
			COALESCE(s.last_activity, u.last_login, NOW()) as last_activity,
			COALESCE(s.updated_at, NOW()) as updated_at
		FROM users u
		LEFT JOIN agent_status s ON u.id = s.agent_id
		WHERE u.role IN ('support', 'admin', 'operator')
		ORDER BY agent_name
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var agents []*AgentStatusInfo
	for rows.Next() {
		a := &AgentStatusInfo{}
		err := rows.Scan(&a.ID, &a.AgentID, &a.AgentName, &a.Status, &a.StatusMessage,
			&a.MaxConcurrentChats, &a.MaxConcurrentTickets, &a.CurrentChats, &a.CurrentTickets,
			&a.LastActivity, &a.UpdatedAt)
		if err != nil {
			return nil, err
		}
		agents = append(agents, a)
	}
	return agents, nil
}

// UpdateAgentStatus actualiza el estado de un agente
func (r *SupportAgentRepository) UpdateAgentStatus(ctx context.Context, agentID int64, status, statusMessage string) error {
	query := `
		INSERT INTO agent_status (agent_id, status, status_message, updated_at)
		VALUES ($1, $2, $3, NOW())
		ON CONFLICT (agent_id) DO UPDATE SET status = $2, status_message = $3, updated_at = NOW()
	`
	_, err := r.pool.Exec(ctx, query, agentID, status, statusMessage)
	return err
}

// ========== INTERNAL CHAT ==========

// InternalMessage mensaje interno
type InternalMessage struct {
	ID          int64      `json:"id"`
	SenderID    int64      `json:"sender_id"`
	SenderName  string     `json:"sender_name"`
	SenderRole  string     `json:"sender_role"`
	RecipientID *int64     `json:"recipient_id"`
	Channel     string     `json:"channel"`
	Message     string     `json:"message"`
	IsPinned    bool       `json:"is_pinned"`
	IsRead      bool       `json:"is_read"`
	ReadAt      *time.Time `json:"read_at"`
	CreatedAt   time.Time  `json:"created_at"`
}

// GetInternalMessages obtiene mensajes internos
func (r *SupportAgentRepository) GetInternalMessages(ctx context.Context, channel string, recipientID *int64) ([]*InternalMessage, error) {
	query := `
		SELECT m.id, m.sender_id,
			COALESCE(u.first_name || ' ' || u.last_name, u.email) as sender_name,
			COALESCE(u.role, 'support') as sender_role,
			m.recipient_id, m.channel, m.message, m.is_pinned, m.is_read, m.read_at, m.created_at
		FROM internal_messages m
		LEFT JOIN users u ON m.sender_id = u.id
		WHERE m.channel = $1
	`
	args := []interface{}{channel}
	if recipientID != nil {
		query += " AND (m.recipient_id IS NULL OR m.recipient_id = $2)"
		args = append(args, *recipientID)
	}
	query += " ORDER BY m.created_at DESC LIMIT 100"

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*InternalMessage
	for rows.Next() {
		m := &InternalMessage{}
		err := rows.Scan(&m.ID, &m.SenderID, &m.SenderName, &m.SenderRole,
			&m.RecipientID, &m.Channel, &m.Message, &m.IsPinned, &m.IsRead, &m.ReadAt, &m.CreatedAt)
		if err != nil {
			return nil, err
		}
		messages = append(messages, m)
	}
	return messages, nil
}

// SendInternalMessage envía un mensaje interno
func (r *SupportAgentRepository) SendInternalMessage(ctx context.Context, senderID int64, recipientID *int64, channel, message string) (*InternalMessage, error) {
	query := `
		INSERT INTO internal_messages (sender_id, recipient_id, channel, message)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`
	m := &InternalMessage{SenderID: senderID, RecipientID: recipientID, Channel: channel, Message: message}
	err := r.pool.QueryRow(ctx, query, senderID, recipientID, channel, message).Scan(&m.ID, &m.CreatedAt)
	return m, err
}

// ========== AGENT SETTINGS ==========

// AgentSettings configuración del agente
type AgentSettings struct {
	ID                  int64   `json:"id"`
	AgentID             int64   `json:"agent_id"`
	EmailNotifications  bool    `json:"email_notifications"`
	PushNotifications   bool    `json:"push_notifications"`
	SoundEnabled        bool    `json:"sound_enabled"`
	SLAAlertMinutes     int     `json:"sla_alert_minutes"`
	DarkMode            bool    `json:"dark_mode"`
	Language            string  `json:"language"`
	Timezone            string  `json:"timezone"`
	AwayMessage         string  `json:"away_message"`
	OutOfHoursMessage   string  `json:"out_of_hours_message"`
	AutoGreeting        string  `json:"auto_greeting"`
	WorkSchedule        string  `json:"work_schedule"` // JSON
	Signature           string  `json:"signature"`
}

// GetAgentSettings obtiene configuración del agente
func (r *SupportAgentRepository) GetAgentSettings(ctx context.Context, agentID int64) (*AgentSettings, error) {
	query := `
		SELECT id, agent_id, email_notifications, push_notifications, sound_enabled,
			sla_alert_minutes, dark_mode, language, timezone,
			COALESCE(away_message, '') as away_message,
			COALESCE(out_of_hours_message, '') as out_of_hours_message,
			COALESCE(auto_greeting, '') as auto_greeting,
			COALESCE(work_schedule::text, '{}') as work_schedule,
			COALESCE(signature, '') as signature
		FROM agent_settings
		WHERE agent_id = $1
	`
	s := &AgentSettings{}
	err := r.pool.QueryRow(ctx, query, agentID).Scan(
		&s.ID, &s.AgentID, &s.EmailNotifications, &s.PushNotifications, &s.SoundEnabled,
		&s.SLAAlertMinutes, &s.DarkMode, &s.Language, &s.Timezone,
		&s.AwayMessage, &s.OutOfHoursMessage, &s.AutoGreeting, &s.WorkSchedule, &s.Signature)
	if err != nil {
		// Crear configuración por defecto si no existe
		s = &AgentSettings{
			AgentID:            agentID,
			EmailNotifications: true,
			PushNotifications:  true,
			SoundEnabled:       true,
			SLAAlertMinutes:    15,
			DarkMode:           false,
			Language:           "es",
			Timezone:           "America/Mexico_City",
			WorkSchedule:       "{}",
		}
	}
	return s, nil
}

// UpdateAgentSettings actualiza configuración del agente
func (r *SupportAgentRepository) UpdateAgentSettings(ctx context.Context, agentID int64, settings map[string]interface{}) error {
	// Primero intentar insertar, si existe actualizar
	query := `
		INSERT INTO agent_settings (agent_id, email_notifications, push_notifications, sound_enabled,
			sla_alert_minutes, dark_mode, language, timezone, away_message, out_of_hours_message,
			auto_greeting, signature, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
		ON CONFLICT (agent_id) DO UPDATE SET
			email_notifications = COALESCE($2, agent_settings.email_notifications),
			push_notifications = COALESCE($3, agent_settings.push_notifications),
			sound_enabled = COALESCE($4, agent_settings.sound_enabled),
			sla_alert_minutes = COALESCE($5, agent_settings.sla_alert_minutes),
			dark_mode = COALESCE($6, agent_settings.dark_mode),
			language = COALESCE($7, agent_settings.language),
			timezone = COALESCE($8, agent_settings.timezone),
			away_message = COALESCE($9, agent_settings.away_message),
			out_of_hours_message = COALESCE($10, agent_settings.out_of_hours_message),
			auto_greeting = COALESCE($11, agent_settings.auto_greeting),
			signature = COALESCE($12, agent_settings.signature),
			updated_at = NOW()
	`
	
	emailNotif, _ := settings["email_notifications"].(bool)
	pushNotif, _ := settings["push_notifications"].(bool)
	soundEnabled, _ := settings["sound_enabled"].(bool)
	slaAlert, _ := settings["sla_alert_minutes"].(int)
	if slaAlert == 0 { slaAlert = 15 }
	darkMode, _ := settings["dark_mode"].(bool)
	language, _ := settings["language"].(string)
	if language == "" { language = "es" }
	timezone, _ := settings["timezone"].(string)
	if timezone == "" { timezone = "America/Mexico_City" }
	awayMsg, _ := settings["away_message"].(string)
	outOfHoursMsg, _ := settings["out_of_hours_message"].(string)
	autoGreeting, _ := settings["auto_greeting"].(string)
	signature, _ := settings["signature"].(string)

	_, err := r.pool.Exec(ctx, query, agentID, emailNotif, pushNotif, soundEnabled,
		slaAlert, darkMode, language, timezone, awayMsg, outOfHoursMsg, autoGreeting, signature)
	return err
}

// ========== REPORTS ==========

// ReportStats estadísticas para reportes
type ReportStats struct {
	TotalTickets       int     `json:"total_tickets"`
	OpenTickets        int     `json:"open_tickets"`
	ResolvedTickets    int     `json:"resolved_tickets"`
	EscalatedTickets   int     `json:"escalated_tickets"`
	AvgResponseMinutes float64 `json:"avg_response_minutes"`
	AvgResolutionHours float64 `json:"avg_resolution_hours"`
	SatisfactionAvg    float64 `json:"satisfaction_avg"`
	TotalChats         int     `json:"total_chats"`
	TotalUsers         int     `json:"total_users"`
}

// GetReportStats obtiene estadísticas para reportes
func (r *SupportAgentRepository) GetReportStats(ctx context.Context, startDate, endDate string) (*ReportStats, error) {
	stats := &ReportStats{}

	// Total tickets en el período
	r.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM support_tickets 
		WHERE created_at >= $1::date AND created_at < $2::date + interval '1 day'
	`, startDate, endDate).Scan(&stats.TotalTickets)

	// Tickets abiertos
	r.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM support_tickets 
		WHERE status IN ('open', 'in_progress', 'waiting')
		AND created_at >= $1::date AND created_at < $2::date + interval '1 day'
	`, startDate, endDate).Scan(&stats.OpenTickets)

	// Tickets resueltos
	r.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM support_tickets 
		WHERE status = 'resolved'
		AND resolved_at >= $1::date AND resolved_at < $2::date + interval '1 day'
	`, startDate, endDate).Scan(&stats.ResolvedTickets)

	// Tickets escalados
	r.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM support_tickets 
		WHERE status = 'escalated'
		AND created_at >= $1::date AND created_at < $2::date + interval '1 day'
	`, startDate, endDate).Scan(&stats.EscalatedTickets)

	// Tiempo promedio de respuesta
	r.pool.QueryRow(ctx, `
		SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (first_response_at - created_at))/60), 0)
		FROM support_tickets 
		WHERE first_response_at IS NOT NULL
		AND created_at >= $1::date AND created_at < $2::date + interval '1 day'
	`, startDate, endDate).Scan(&stats.AvgResponseMinutes)

	// Tiempo promedio de resolución
	r.pool.QueryRow(ctx, `
		SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600), 0)
		FROM support_tickets 
		WHERE resolved_at IS NOT NULL
		AND created_at >= $1::date AND created_at < $2::date + interval '1 day'
	`, startDate, endDate).Scan(&stats.AvgResolutionHours)

	// Satisfacción promedio
	r.pool.QueryRow(ctx, `
		SELECT COALESCE(AVG(satisfaction_rating), 0)
		FROM support_tickets 
		WHERE satisfaction_rating IS NOT NULL
		AND created_at >= $1::date AND created_at < $2::date + interval '1 day'
	`, startDate, endDate).Scan(&stats.SatisfactionAvg)

	// Total chats
	r.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM live_chats 
		WHERE created_at >= $1::date AND created_at < $2::date + interval '1 day'
	`, startDate, endDate).Scan(&stats.TotalChats)

	// Total usuarios únicos
	r.pool.QueryRow(ctx, `
		SELECT COUNT(DISTINCT user_id) FROM support_tickets 
		WHERE created_at >= $1::date AND created_at < $2::date + interval '1 day'
	`, startDate, endDate).Scan(&stats.TotalUsers)

	return stats, nil
}


// ========== TICKET TAGS ==========

// AddTicketTag agrega un tag a un ticket
func (r *SupportAgentRepository) AddTicketTag(ctx context.Context, ticketID int64, tag string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE support_tickets 
		SET tags = array_append(COALESCE(tags, '{}'), $2), updated_at = NOW()
		WHERE id = $1 AND NOT ($2 = ANY(COALESCE(tags, '{}')))
	`, ticketID, tag)
	return err
}

// RemoveTicketTag elimina un tag de un ticket
func (r *SupportAgentRepository) RemoveTicketTag(ctx context.Context, ticketID int64, tag string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE support_tickets 
		SET tags = array_remove(COALESCE(tags, '{}'), $2), updated_at = NOW()
		WHERE id = $1
	`, ticketID, tag)
	return err
}

// ========== TICKET COLLABORATORS ==========

// AddTicketCollaborator agrega un colaborador a un ticket
func (r *SupportAgentRepository) AddTicketCollaborator(ctx context.Context, ticketID, agentID int64) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO ticket_collaborators (ticket_id, agent_id)
		VALUES ($1, $2)
		ON CONFLICT (ticket_id, agent_id) DO NOTHING
	`, ticketID, agentID)
	return err
}

// RemoveTicketCollaborator elimina un colaborador de un ticket
func (r *SupportAgentRepository) RemoveTicketCollaborator(ctx context.Context, ticketID, agentID int64) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM ticket_collaborators WHERE ticket_id = $1 AND agent_id = $2", ticketID, agentID)
	return err
}

// GetTicketCollaborators obtiene los colaboradores de un ticket
func (r *SupportAgentRepository) GetTicketCollaborators(ctx context.Context, ticketID int64) ([]string, error) {
	query := `
		SELECT COALESCE(u.first_name || ' ' || u.last_name, u.email) as name
		FROM ticket_collaborators tc
		JOIN users u ON tc.agent_id = u.id
		WHERE tc.ticket_id = $1
	`
	rows, err := r.pool.Query(ctx, query, ticketID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var collaborators []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			return nil, err
		}
		collaborators = append(collaborators, name)
	}
	return collaborators, nil
}

// ========== MERGE TICKETS ==========

// MergeTickets fusiona tickets secundarios en uno principal
func (r *SupportAgentRepository) MergeTickets(ctx context.Context, primaryID int64, secondaryIDs []int64) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	for _, secID := range secondaryIDs {
		// Mover mensajes al ticket principal
		_, err = tx.Exec(ctx, `
			UPDATE ticket_messages SET ticket_id = $1 WHERE ticket_id = $2
		`, primaryID, secID)
		if err != nil {
			return err
		}

		// Marcar ticket secundario como cerrado y fusionado
		_, err = tx.Exec(ctx, `
			UPDATE support_tickets 
			SET status = 'closed', merged_into = $1, updated_at = NOW()
			WHERE id = $2
		`, primaryID, secID)
		if err != nil {
			return err
		}
	}

	// Actualizar el ticket principal con referencia a los fusionados
	_, err = tx.Exec(ctx, `
		UPDATE support_tickets 
		SET merged_from = array_cat(COALESCE(merged_from, '{}'), $2::bigint[]), updated_at = NOW()
		WHERE id = $1
	`, primaryID, secondaryIDs)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

// ========== TICKET RATING ==========

// RequestTicketRating envía solicitud de calificación
func (r *SupportAgentRepository) RequestTicketRating(ctx context.Context, ticketID int64) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE support_tickets SET rating_requested = true, rating_requested_at = NOW(), updated_at = NOW()
		WHERE id = $1
	`, ticketID)
	return err
}

// SetTicketRating establece la calificación de un ticket
func (r *SupportAgentRepository) SetTicketRating(ctx context.Context, ticketID int64, rating int) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE support_tickets SET satisfaction_rating = $2, updated_at = NOW()
		WHERE id = $1
	`, ticketID, rating)
	return err
}

// ========== TEMPLATE FAVORITES ==========

// ToggleTemplateFavorite alterna el estado de favorito de una plantilla
func (r *SupportAgentRepository) ToggleTemplateFavorite(ctx context.Context, templateID int64) (bool, error) {
	var isFavorite bool
	err := r.pool.QueryRow(ctx, `
		UPDATE support_templates 
		SET is_favorite = NOT COALESCE(is_favorite, false), updated_at = NOW()
		WHERE id = $1
		RETURNING is_favorite
	`, templateID).Scan(&isFavorite)
	return isFavorite, err
}

// IncrementTemplateUsage incrementa el contador de uso de una plantilla
func (r *SupportAgentRepository) IncrementTemplateUsage(ctx context.Context, templateID int64) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE support_templates SET usage_count = COALESCE(usage_count, 0) + 1, updated_at = NOW()
		WHERE id = $1
	`, templateID)
	return err
}

// ========== AGENT NOTES (Personal) ==========

// AgentPersonalNote nota personal del agente
type AgentPersonalNote struct {
	ID        int64     `json:"id"`
	AgentID   int64     `json:"agent_id"`
	Content   string    `json:"content"`
	Color     string    `json:"color"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// GetAgentNotes obtiene las notas personales de un agente
func (r *SupportAgentRepository) GetAgentNotes(ctx context.Context, agentID int64) ([]*AgentPersonalNote, error) {
	query := `
		SELECT id, agent_id, content, COALESCE(color, '#3b82f6') as color, created_at, updated_at
		FROM agent_personal_notes
		WHERE agent_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, agentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notes []*AgentPersonalNote
	for rows.Next() {
		n := &AgentPersonalNote{}
		if err := rows.Scan(&n.ID, &n.AgentID, &n.Content, &n.Color, &n.CreatedAt, &n.UpdatedAt); err != nil {
			return nil, err
		}
		notes = append(notes, n)
	}
	return notes, nil
}

// CreateAgentNote crea una nota personal
func (r *SupportAgentRepository) CreateAgentNote(ctx context.Context, agentID int64, content, color string) (*AgentPersonalNote, error) {
	if color == "" {
		color = "#3b82f6"
	}
	query := `
		INSERT INTO agent_personal_notes (agent_id, content, color)
		VALUES ($1, $2, $3)
		RETURNING id, created_at, updated_at
	`
	n := &AgentPersonalNote{AgentID: agentID, Content: content, Color: color}
	err := r.pool.QueryRow(ctx, query, agentID, content, color).Scan(&n.ID, &n.CreatedAt, &n.UpdatedAt)
	return n, err
}

// DeleteAgentNote elimina una nota personal
func (r *SupportAgentRepository) DeleteAgentNote(ctx context.Context, noteID, agentID int64) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM agent_personal_notes WHERE id = $1 AND agent_id = $2", noteID, agentID)
	return err
}

// ========== CHAT NOTES ==========

// ChatNote nota de chat
type ChatNote struct {
	ID        int64     `json:"id"`
	ChatID    int64     `json:"chat_id"`
	AgentID   int64     `json:"agent_id"`
	Note      string    `json:"note"`
	CreatedAt time.Time `json:"created_at"`
}

// GetChatNotes obtiene las notas de un chat
func (r *SupportAgentRepository) GetChatNotes(ctx context.Context, chatID int64) ([]*ChatNote, error) {
	query := `
		SELECT id, chat_id, agent_id, note, created_at
		FROM chat_notes
		WHERE chat_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, chatID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notes []*ChatNote
	for rows.Next() {
		n := &ChatNote{}
		if err := rows.Scan(&n.ID, &n.ChatID, &n.AgentID, &n.Note, &n.CreatedAt); err != nil {
			return nil, err
		}
		notes = append(notes, n)
	}
	return notes, nil
}

// AddChatNote agrega una nota a un chat
func (r *SupportAgentRepository) AddChatNote(ctx context.Context, chatID, agentID int64, note string) (*ChatNote, error) {
	query := `
		INSERT INTO chat_notes (chat_id, agent_id, note)
		VALUES ($1, $2, $3)
		RETURNING id, created_at
	`
	n := &ChatNote{ChatID: chatID, AgentID: agentID, Note: note}
	err := r.pool.QueryRow(ctx, query, chatID, agentID, note).Scan(&n.ID, &n.CreatedAt)
	return n, err
}

// ========== CREATE TICKET FROM CHAT ==========

// CreateTicketFromChat crea un ticket a partir de un chat
func (r *SupportAgentRepository) CreateTicketFromChat(ctx context.Context, chatID, agentID int64) (*AgentTicket, error) {
	// Obtener info del chat
	chat, err := r.GetLiveChatByID(ctx, chatID)
	if err != nil {
		return nil, err
	}

	// Crear ticket
	ticketNumber := fmt.Sprintf("TK-%d", time.Now().UnixNano()%1000000)
	query := `
		INSERT INTO support_tickets (ticket_number, user_id, subject, description, category_id, priority, status, assigned_to, source)
		VALUES ($1, $2, $3, $4, NULL, 'medium', 'open', $5, 'chat')
		RETURNING id, created_at, updated_at
	`
	subject := fmt.Sprintf("Seguimiento de chat #%d", chatID)
	description := fmt.Sprintf("Ticket creado desde chat en vivo con %s", chat.UserName)

	t := &AgentTicket{
		TicketNumber: ticketNumber,
		UserID:       chat.UserID,
		UserName:     chat.UserName,
		UserEmail:    chat.UserEmail,
		Subject:      subject,
		Description:  description,
		Priority:     "medium",
		Status:       "open",
		AssignedTo:   &agentID,
	}
	err = r.pool.QueryRow(ctx, query, ticketNumber, chat.UserID, subject, description, agentID).Scan(&t.ID, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		return nil, err
	}

	// Copiar mensajes del chat al ticket
	_, err = r.pool.Exec(ctx, `
		INSERT INTO ticket_messages (ticket_id, sender_id, sender_type, message, created_at)
		SELECT $1, sender_id, sender_type, message, created_at
		FROM live_chat_messages
		WHERE chat_id = $2
	`, t.ID, chatID)

	return t, err
}

// ========== BULK OPERATIONS ==========

// BulkAssignTickets asigna múltiples tickets a un agente
func (r *SupportAgentRepository) BulkAssignTickets(ctx context.Context, ticketIDs []int64, agentID int64) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE support_tickets 
		SET assigned_to = $1, assigned_at = NOW(), updated_at = NOW()
		WHERE id = ANY($2)
	`, agentID, ticketIDs)
	return err
}

// BulkEscalateTickets escala múltiples tickets
func (r *SupportAgentRepository) BulkEscalateTickets(ctx context.Context, ticketIDs []int64, escalateTo string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE support_tickets 
		SET status = 'escalated', escalated_to = $1, escalated_at = NOW(), updated_at = NOW()
		WHERE id = ANY($2)
	`, escalateTo, ticketIDs)
	return err
}

// ========== CHAT RATING ==========

// RequestChatRating solicita calificación de chat
func (r *SupportAgentRepository) RequestChatRating(ctx context.Context, chatID int64) error {
	// Agregar mensaje de sistema solicitando rating
	_, err := r.pool.Exec(ctx, `
		INSERT INTO live_chat_messages (chat_id, sender_id, sender_type, message)
		VALUES ($1, 0, 'system', '⭐ ¿Cómo calificarías esta atención? (1-5 estrellas)')
	`, chatID)
	if err != nil {
		return err
	}
	
	// Marcar que se solicitó rating
	_, err = r.pool.Exec(ctx, `
		UPDATE live_chats SET rating_requested = true WHERE id = $1
	`, chatID)
	return err
}

// SetChatRating establece la calificación de un chat
func (r *SupportAgentRepository) SetChatRating(ctx context.Context, chatID int64, rating int) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE live_chats SET rating = $2 WHERE id = $1
	`, chatID, rating)
	return err
}

// ========== TRANSFER TICKET ==========

// TransferTicket transfiere un ticket a otro agente
func (r *SupportAgentRepository) TransferTicket(ctx context.Context, ticketID, fromAgentID, toAgentID int64, reason string) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Actualizar asignación
	_, err = tx.Exec(ctx, `
		UPDATE support_tickets 
		SET assigned_to = $1, updated_at = NOW()
		WHERE id = $2
	`, toAgentID, ticketID)
	if err != nil {
		return err
	}

	// Agregar nota interna sobre la transferencia
	_, err = tx.Exec(ctx, `
		INSERT INTO ticket_messages (ticket_id, sender_id, sender_type, message, is_internal)
		VALUES ($1, $2, 'support', $3, true)
	`, ticketID, fromAgentID, fmt.Sprintf("Ticket transferido. Razón: %s", reason))
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

// ========== AGENT SCHEDULE ==========

// AgentScheduleDay horario de un día
type AgentScheduleDay struct {
	ID           int64     `json:"id"`
	AgentID      int64     `json:"agent_id"`
	DayOfWeek    int       `json:"day_of_week"`
	IsWorkingDay bool      `json:"is_working_day"`
	StartTime    *string   `json:"start_time"`
	EndTime      *string   `json:"end_time"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// GetAgentSchedule obtiene el horario de un agente
func (r *SupportAgentRepository) GetAgentSchedule(ctx context.Context, agentID int64) ([]*AgentScheduleDay, error) {
	query := `
		SELECT id, agent_id, day_of_week, is_working_day, 
			start_time::text, end_time::text, created_at, updated_at
		FROM agent_schedule
		WHERE agent_id = $1
		ORDER BY day_of_week
	`
	rows, err := r.pool.Query(ctx, query, agentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var schedule []*AgentScheduleDay
	for rows.Next() {
		s := &AgentScheduleDay{}
		if err := rows.Scan(&s.ID, &s.AgentID, &s.DayOfWeek, &s.IsWorkingDay, 
			&s.StartTime, &s.EndTime, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		schedule = append(schedule, s)
	}
	return schedule, nil
}

// UpdateAgentSchedule actualiza el horario de un día
func (r *SupportAgentRepository) UpdateAgentSchedule(ctx context.Context, agentID int64, dayOfWeek int, isWorkingDay bool, startTime, endTime string) error {
	query := `
		INSERT INTO agent_schedule (agent_id, day_of_week, is_working_day, start_time, end_time, updated_at)
		VALUES ($1, $2, $3, $4::time, $5::time, NOW())
		ON CONFLICT (agent_id, day_of_week) DO UPDATE SET
			is_working_day = $3, start_time = $4::time, end_time = $5::time, updated_at = NOW()
	`
	_, err := r.pool.Exec(ctx, query, agentID, dayOfWeek, isWorkingDay, startTime, endTime)
	return err
}

// AgentBreak pausa del agente
type AgentBreak struct {
	ID        int64     `json:"id"`
	AgentID   int64     `json:"agent_id"`
	Name      string    `json:"name"`
	StartTime string    `json:"start_time"`
	EndTime   string    `json:"end_time"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
}

// GetAgentBreaks obtiene las pausas de un agente
func (r *SupportAgentRepository) GetAgentBreaks(ctx context.Context, agentID int64) ([]*AgentBreak, error) {
	query := `
		SELECT id, agent_id, name, start_time::text, end_time::text, is_active, created_at
		FROM agent_breaks
		WHERE agent_id = $1
		ORDER BY start_time
	`
	rows, err := r.pool.Query(ctx, query, agentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var breaks []*AgentBreak
	for rows.Next() {
		b := &AgentBreak{}
		if err := rows.Scan(&b.ID, &b.AgentID, &b.Name, &b.StartTime, &b.EndTime, &b.IsActive, &b.CreatedAt); err != nil {
			return nil, err
		}
		breaks = append(breaks, b)
	}
	return breaks, nil
}

// CreateAgentBreak crea una pausa
func (r *SupportAgentRepository) CreateAgentBreak(ctx context.Context, agentID int64, name, startTime, endTime string) (*AgentBreak, error) {
	query := `
		INSERT INTO agent_breaks (agent_id, name, start_time, end_time)
		VALUES ($1, $2, $3::time, $4::time)
		RETURNING id, created_at
	`
	b := &AgentBreak{AgentID: agentID, Name: name, StartTime: startTime, EndTime: endTime, IsActive: true}
	err := r.pool.QueryRow(ctx, query, agentID, name, startTime, endTime).Scan(&b.ID, &b.CreatedAt)
	return b, err
}

// DeleteAgentBreak elimina una pausa
func (r *SupportAgentRepository) DeleteAgentBreak(ctx context.Context, breakID, agentID int64) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM agent_breaks WHERE id = $1 AND agent_id = $2", breakID, agentID)
	return err
}

// AgentVacation vacaciones del agente
type AgentVacation struct {
	ID         int64      `json:"id"`
	AgentID    int64      `json:"agent_id"`
	StartDate  string     `json:"start_date"`
	EndDate    string     `json:"end_date"`
	Reason     string     `json:"reason"`
	Status     string     `json:"status"`
	ApprovedBy *int64     `json:"approved_by"`
	CreatedAt  time.Time  `json:"created_at"`
}

// GetAgentVacations obtiene las vacaciones de un agente
func (r *SupportAgentRepository) GetAgentVacations(ctx context.Context, agentID int64) ([]*AgentVacation, error) {
	query := `
		SELECT id, agent_id, start_date::text, end_date::text, 
			COALESCE(reason, '') as reason, status, approved_by, created_at
		FROM agent_vacations
		WHERE agent_id = $1
		ORDER BY start_date DESC
	`
	rows, err := r.pool.Query(ctx, query, agentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var vacations []*AgentVacation
	for rows.Next() {
		v := &AgentVacation{}
		if err := rows.Scan(&v.ID, &v.AgentID, &v.StartDate, &v.EndDate, &v.Reason, &v.Status, &v.ApprovedBy, &v.CreatedAt); err != nil {
			return nil, err
		}
		vacations = append(vacations, v)
	}
	return vacations, nil
}

// CreateAgentVacation crea una solicitud de vacaciones
func (r *SupportAgentRepository) CreateAgentVacation(ctx context.Context, agentID int64, startDate, endDate, reason string) (*AgentVacation, error) {
	query := `
		INSERT INTO agent_vacations (agent_id, start_date, end_date, reason)
		VALUES ($1, $2::date, $3::date, $4)
		RETURNING id, status, created_at
	`
	v := &AgentVacation{AgentID: agentID, StartDate: startDate, EndDate: endDate, Reason: reason}
	err := r.pool.QueryRow(ctx, query, agentID, startDate, endDate, reason).Scan(&v.ID, &v.Status, &v.CreatedAt)
	return v, err
}

// UpdateVacationStatus actualiza el estado de una solicitud de vacaciones
func (r *SupportAgentRepository) UpdateVacationStatus(ctx context.Context, vacationID int64, status string, approvedBy int64) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE agent_vacations SET status = $2, approved_by = $3 WHERE id = $1
	`, vacationID, status, approvedBy)
	return err
}

// ========== SLA POLICIES ==========

// SLAPolicy política de SLA
type SLAPolicy struct {
	ID                 int64     `json:"id"`
	Name               string    `json:"name"`
	Category           *string   `json:"category"`
	Priority           *string   `json:"priority"`
	FirstResponseHours int       `json:"first_response_hours"`
	ResolutionHours    int       `json:"resolution_hours"`
	IsActive           bool      `json:"is_active"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

// GetSLAPolicies obtiene todas las políticas de SLA
func (r *SupportAgentRepository) GetSLAPolicies(ctx context.Context) ([]*SLAPolicy, error) {
	query := `
		SELECT id, name, category, priority, first_response_hours, resolution_hours, 
			is_active, created_at, updated_at
		FROM sla_policies
		ORDER BY first_response_hours ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var policies []*SLAPolicy
	for rows.Next() {
		p := &SLAPolicy{}
		if err := rows.Scan(&p.ID, &p.Name, &p.Category, &p.Priority, &p.FirstResponseHours, 
			&p.ResolutionHours, &p.IsActive, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		policies = append(policies, p)
	}
	return policies, nil
}

// CreateSLAPolicy crea una política de SLA
func (r *SupportAgentRepository) CreateSLAPolicy(ctx context.Context, name string, category, priority *string, firstResponseHours, resolutionHours int) (*SLAPolicy, error) {
	query := `
		INSERT INTO sla_policies (name, category, priority, first_response_hours, resolution_hours)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, is_active, created_at, updated_at
	`
	p := &SLAPolicy{Name: name, Category: category, Priority: priority, FirstResponseHours: firstResponseHours, ResolutionHours: resolutionHours}
	err := r.pool.QueryRow(ctx, query, name, category, priority, firstResponseHours, resolutionHours).Scan(&p.ID, &p.IsActive, &p.CreatedAt, &p.UpdatedAt)
	return p, err
}

// UpdateSLAPolicy actualiza una política de SLA
func (r *SupportAgentRepository) UpdateSLAPolicy(ctx context.Context, id int64, name *string, firstResponseHours, resolutionHours *int, isActive *bool) error {
	query := "UPDATE sla_policies SET updated_at = NOW()"
	args := []interface{}{}
	argNum := 1

	if name != nil {
		query += fmt.Sprintf(", name = $%d", argNum)
		args = append(args, *name)
		argNum++
	}
	if firstResponseHours != nil {
		query += fmt.Sprintf(", first_response_hours = $%d", argNum)
		args = append(args, *firstResponseHours)
		argNum++
	}
	if resolutionHours != nil {
		query += fmt.Sprintf(", resolution_hours = $%d", argNum)
		args = append(args, *resolutionHours)
		argNum++
	}
	if isActive != nil {
		query += fmt.Sprintf(", is_active = $%d", argNum)
		args = append(args, *isActive)
		argNum++
	}

	query += fmt.Sprintf(" WHERE id = $%d", argNum)
	args = append(args, id)

	_, err := r.pool.Exec(ctx, query, args...)
	return err
}

// ========== TICKET ATTACHMENTS ==========

// TicketAttachment adjunto de ticket
type TicketAttachment struct {
	ID         int64     `json:"id"`
	TicketID   int64     `json:"ticket_id"`
	MessageID  *int64    `json:"message_id"`
	FileName   string    `json:"file_name"`
	FileURL    string    `json:"file_url"`
	FileType   string    `json:"file_type"`
	FileSize   int       `json:"file_size"`
	UploadedBy *int64    `json:"uploaded_by"`
	CreatedAt  time.Time `json:"created_at"`
}

// GetTicketAttachments obtiene los adjuntos de un ticket
func (r *SupportAgentRepository) GetTicketAttachments(ctx context.Context, ticketID int64) ([]*TicketAttachment, error) {
	query := `
		SELECT id, ticket_id, message_id, file_name, file_url, 
			COALESCE(file_type, '') as file_type, COALESCE(file_size, 0) as file_size, 
			uploaded_by, created_at
		FROM ticket_attachments
		WHERE ticket_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, ticketID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var attachments []*TicketAttachment
	for rows.Next() {
		a := &TicketAttachment{}
		if err := rows.Scan(&a.ID, &a.TicketID, &a.MessageID, &a.FileName, &a.FileURL, 
			&a.FileType, &a.FileSize, &a.UploadedBy, &a.CreatedAt); err != nil {
			return nil, err
		}
		attachments = append(attachments, a)
	}
	return attachments, nil
}

// AddTicketAttachment agrega un adjunto a un ticket
func (r *SupportAgentRepository) AddTicketAttachment(ctx context.Context, ticketID int64, messageID *int64, fileName, fileURL, fileType string, fileSize int, uploadedBy int64) (*TicketAttachment, error) {
	query := `
		INSERT INTO ticket_attachments (ticket_id, message_id, file_name, file_url, file_type, file_size, uploaded_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at
	`
	a := &TicketAttachment{TicketID: ticketID, MessageID: messageID, FileName: fileName, FileURL: fileURL, FileType: fileType, FileSize: fileSize, UploadedBy: &uploadedBy}
	err := r.pool.QueryRow(ctx, query, ticketID, messageID, fileName, fileURL, fileType, fileSize, uploadedBy).Scan(&a.ID, &a.CreatedAt)
	return a, err
}

// DeleteTicketAttachment elimina un adjunto
func (r *SupportAgentRepository) DeleteTicketAttachment(ctx context.Context, attachmentID int64) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM ticket_attachments WHERE id = $1", attachmentID)
	return err
}

// ========== CHAT TRANSFERS ==========

// ChatTransfer transferencia de chat
type ChatTransfer struct {
	ID          int64      `json:"id"`
	ChatID      int64      `json:"chat_id"`
	FromAgentID int64      `json:"from_agent_id"`
	ToAgentID   int64      `json:"to_agent_id"`
	Reason      string     `json:"reason"`
	Accepted    bool       `json:"accepted"`
	AcceptedAt  *time.Time `json:"accepted_at"`
	CreatedAt   time.Time  `json:"created_at"`
}

// TransferChat transfiere un chat a otro agente
func (r *SupportAgentRepository) TransferChat(ctx context.Context, chatID, fromAgentID, toAgentID int64, reason string) (*ChatTransfer, error) {
	query := `
		INSERT INTO live_chat_transfers (chat_id, from_agent_id, to_agent_id, reason)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`
	t := &ChatTransfer{ChatID: chatID, FromAgentID: fromAgentID, ToAgentID: toAgentID, Reason: reason}
	err := r.pool.QueryRow(ctx, query, chatID, fromAgentID, toAgentID, reason).Scan(&t.ID, &t.CreatedAt)
	return t, err
}

// AcceptChatTransfer acepta una transferencia de chat
func (r *SupportAgentRepository) AcceptChatTransfer(ctx context.Context, transferID, agentID int64) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Obtener info de la transferencia
	var chatID int64
	err = tx.QueryRow(ctx, `
		UPDATE live_chat_transfers 
		SET accepted = true, accepted_at = NOW()
		WHERE id = $1 AND to_agent_id = $2
		RETURNING chat_id
	`, transferID, agentID).Scan(&chatID)
	if err != nil {
		return err
	}

	// Actualizar el chat con el nuevo agente
	_, err = tx.Exec(ctx, `
		UPDATE live_chats SET agent_id = $1 WHERE id = $2
	`, agentID, chatID)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

// GetPendingChatTransfers obtiene transferencias pendientes para un agente
func (r *SupportAgentRepository) GetPendingChatTransfers(ctx context.Context, agentID int64) ([]*ChatTransfer, error) {
	query := `
		SELECT id, chat_id, from_agent_id, to_agent_id, COALESCE(reason, '') as reason, 
			accepted, accepted_at, created_at
		FROM live_chat_transfers
		WHERE to_agent_id = $1 AND accepted = false
		ORDER BY created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, agentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transfers []*ChatTransfer
	for rows.Next() {
		t := &ChatTransfer{}
		if err := rows.Scan(&t.ID, &t.ChatID, &t.FromAgentID, &t.ToAgentID, &t.Reason, 
			&t.Accepted, &t.AcceptedAt, &t.CreatedAt); err != nil {
			return nil, err
		}
		transfers = append(transfers, t)
	}
	return transfers, nil
}

// ========== QUICK REPLIES ==========

// QuickReply respuesta rápida
type QuickReply struct {
	ID           int64     `json:"id"`
	Text         string    `json:"text"`
	Category     string    `json:"category"`
	DisplayOrder int       `json:"display_order"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
}

// GetQuickReplies obtiene las respuestas rápidas
func (r *SupportAgentRepository) GetQuickReplies(ctx context.Context) ([]*QuickReply, error) {
	query := `
		SELECT id, text, COALESCE(category, 'general') as category, display_order, is_active, created_at
		FROM quick_replies
		WHERE is_active = true
		ORDER BY display_order ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var replies []*QuickReply
	for rows.Next() {
		q := &QuickReply{}
		if err := rows.Scan(&q.ID, &q.Text, &q.Category, &q.DisplayOrder, &q.IsActive, &q.CreatedAt); err != nil {
			return nil, err
		}
		replies = append(replies, q)
	}
	return replies, nil
}

// CreateQuickReply crea una respuesta rápida
func (r *SupportAgentRepository) CreateQuickReply(ctx context.Context, text, category string, displayOrder int) (*QuickReply, error) {
	query := `
		INSERT INTO quick_replies (text, category, display_order)
		VALUES ($1, $2, $3)
		RETURNING id, is_active, created_at
	`
	q := &QuickReply{Text: text, Category: category, DisplayOrder: displayOrder}
	err := r.pool.QueryRow(ctx, query, text, category, displayOrder).Scan(&q.ID, &q.IsActive, &q.CreatedAt)
	return q, err
}

// DeleteQuickReply elimina una respuesta rápida
func (r *SupportAgentRepository) DeleteQuickReply(ctx context.Context, id int64) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM quick_replies WHERE id = $1", id)
	return err
}

// ========== TICKET CATEGORIES ==========

// TicketCategory categoría de ticket
type TicketCategory struct {
	ID              int64   `json:"id"`
	Name            string  `json:"name"`
	Slug            string  `json:"slug"`
	Description     string  `json:"description"`
	Icon            string  `json:"icon"`
	Color           string  `json:"color"`
	SLAHours        int     `json:"sla_hours"`
	DefaultPriority string  `json:"default_priority"`
	DisplayOrder    int     `json:"display_order"`
	IsActive        bool    `json:"is_active"`
}

// GetTicketCategories obtiene las categorías de tickets
func (r *SupportAgentRepository) GetTicketCategories(ctx context.Context) ([]*TicketCategory, error) {
	query := `
		SELECT id, name, COALESCE(slug, '') as slug, COALESCE(description, '') as description,
			COALESCE(icon, 'help-circle') as icon, COALESCE(color, '#3b82f6') as color,
			COALESCE(sla_hours, 24) as sla_hours, COALESCE(default_priority, 'medium') as default_priority,
			COALESCE(display_order, 0) as display_order, is_active
		FROM ticket_categories
		WHERE is_active = true
		ORDER BY display_order ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []*TicketCategory
	for rows.Next() {
		c := &TicketCategory{}
		if err := rows.Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.Icon, &c.Color, 
			&c.SLAHours, &c.DefaultPriority, &c.DisplayOrder, &c.IsActive); err != nil {
			return nil, err
		}
		categories = append(categories, c)
	}
	return categories, nil
}


// ========== FAQ FEEDBACK ==========

// FAQFeedback feedback de FAQ
type FAQFeedback struct {
	ID        int64     `json:"id"`
	FAQID     int64     `json:"faq_id"`
	UserID    *int64    `json:"user_id"`
	IsHelpful bool      `json:"is_helpful"`
	Comment   string    `json:"comment"`
	CreatedAt time.Time `json:"created_at"`
}

// GetFAQFeedback obtiene el feedback de una FAQ
func (r *SupportAgentRepository) GetFAQFeedback(ctx context.Context, faqID int64) ([]*FAQFeedback, error) {
	query := `
		SELECT id, faq_id, user_id, is_helpful, COALESCE(comment, '') as comment, created_at
		FROM faq_feedback
		WHERE faq_id = $1
		ORDER BY created_at DESC
		LIMIT 50
	`
	rows, err := r.pool.Query(ctx, query, faqID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var feedback []*FAQFeedback
	for rows.Next() {
		f := &FAQFeedback{}
		if err := rows.Scan(&f.ID, &f.FAQID, &f.UserID, &f.IsHelpful, &f.Comment, &f.CreatedAt); err != nil {
			return nil, err
		}
		feedback = append(feedback, f)
	}
	return feedback, nil
}

// AddFAQFeedback agrega feedback a una FAQ
func (r *SupportAgentRepository) AddFAQFeedback(ctx context.Context, faqID int64, userID *int64, isHelpful bool, comment string) (*FAQFeedback, error) {
	query := `
		INSERT INTO faq_feedback (faq_id, user_id, is_helpful, comment)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`
	f := &FAQFeedback{FAQID: faqID, UserID: userID, IsHelpful: isHelpful, Comment: comment}
	err := r.pool.QueryRow(ctx, query, faqID, userID, isHelpful, comment).Scan(&f.ID, &f.CreatedAt)
	if err != nil {
		return nil, err
	}

	// Actualizar contadores en la FAQ
	if isHelpful {
		r.pool.Exec(ctx, "UPDATE faq_articles SET helpful_count = helpful_count + 1 WHERE id = $1", faqID)
	} else {
		r.pool.Exec(ctx, "UPDATE faq_articles SET not_helpful_count = not_helpful_count + 1 WHERE id = $1", faqID)
	}

	return f, nil
}


// ========== TICKET HISTORY ==========

// TicketHistoryEntry entrada del historial de ticket
type TicketHistoryEntry struct {
	ID              int64     `json:"id"`
	TicketID        int64     `json:"ticket_id"`
	Action          string    `json:"action"`
	PerformedBy     *int64    `json:"performed_by"`
	PerformedByName string    `json:"performed_by_name"`
	PerformedByType string    `json:"performed_by_type"`
	OldValue        string    `json:"old_value"`
	NewValue        string    `json:"new_value"`
	Details         string    `json:"details"`
	CreatedAt       time.Time `json:"created_at"`
}

// GetTicketHistory obtiene el historial de un ticket
func (r *SupportAgentRepository) GetTicketHistory(ctx context.Context, ticketID int64) ([]*TicketHistoryEntry, error) {
	query := `
		SELECT id, ticket_id, action, performed_by, 
			COALESCE(performed_by_name, 'Sistema') as performed_by_name,
			COALESCE(performed_by_type, 'system') as performed_by_type,
			COALESCE(old_value, '') as old_value,
			COALESCE(new_value, '') as new_value,
			COALESCE(details, '') as details,
			created_at
		FROM ticket_history
		WHERE ticket_id = $1
		ORDER BY created_at DESC
		LIMIT 100
	`
	rows, err := r.pool.Query(ctx, query, ticketID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []*TicketHistoryEntry
	for rows.Next() {
		h := &TicketHistoryEntry{}
		if err := rows.Scan(&h.ID, &h.TicketID, &h.Action, &h.PerformedBy, &h.PerformedByName,
			&h.PerformedByType, &h.OldValue, &h.NewValue, &h.Details, &h.CreatedAt); err != nil {
			return nil, err
		}
		history = append(history, h)
	}
	return history, nil
}

// AddTicketHistory agrega una entrada al historial
func (r *SupportAgentRepository) AddTicketHistory(ctx context.Context, ticketID int64, action string, performedBy int64, performedByName, performedByType, oldValue, newValue, details string) error {
	query := `
		INSERT INTO ticket_history (ticket_id, action, performed_by, performed_by_name, performed_by_type, old_value, new_value, details)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.pool.Exec(ctx, query, ticketID, action, performedBy, performedByName, performedByType, oldValue, newValue, details)
	return err
}


// ========== CHAT ATTACHMENTS ==========

// ChatAttachment adjunto de chat
type ChatAttachment struct {
	ID         int64     `json:"id"`
	ChatID     int64     `json:"chat_id"`
	MessageID  *int64    `json:"message_id"`
	FileName   string    `json:"file_name"`
	FileURL    string    `json:"file_url"`
	FileType   string    `json:"file_type"`
	FileSize   int       `json:"file_size"`
	UploadedBy *int64    `json:"uploaded_by"`
	CreatedAt  time.Time `json:"created_at"`
}

// GetChatAttachments obtiene los adjuntos de un chat
func (r *SupportAgentRepository) GetChatAttachments(ctx context.Context, chatID int64) ([]*ChatAttachment, error) {
	query := `
		SELECT id, chat_id, message_id, file_name, file_url,
			COALESCE(file_type, '') as file_type, COALESCE(file_size, 0) as file_size,
			uploaded_by, created_at
		FROM live_chat_attachments
		WHERE chat_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, chatID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var attachments []*ChatAttachment
	for rows.Next() {
		a := &ChatAttachment{}
		if err := rows.Scan(&a.ID, &a.ChatID, &a.MessageID, &a.FileName, &a.FileURL,
			&a.FileType, &a.FileSize, &a.UploadedBy, &a.CreatedAt); err != nil {
			return nil, err
		}
		attachments = append(attachments, a)
	}
	return attachments, nil
}

// AddChatAttachment agrega un adjunto a un chat
func (r *SupportAgentRepository) AddChatAttachment(ctx context.Context, chatID int64, messageID *int64, fileName, fileURL, fileType string, fileSize int, uploadedBy int64) (*ChatAttachment, error) {
	query := `
		INSERT INTO live_chat_attachments (chat_id, message_id, file_name, file_url, file_type, file_size, uploaded_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at
	`
	a := &ChatAttachment{ChatID: chatID, MessageID: messageID, FileName: fileName, FileURL: fileURL, FileType: fileType, FileSize: fileSize, UploadedBy: &uploadedBy}
	err := r.pool.QueryRow(ctx, query, chatID, messageID, fileName, fileURL, fileType, fileSize, uploadedBy).Scan(&a.ID, &a.CreatedAt)
	return a, err
}

// DeleteChatAttachment elimina un adjunto de chat
func (r *SupportAgentRepository) DeleteChatAttachment(ctx context.Context, attachmentID int64) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM live_chat_attachments WHERE id = $1", attachmentID)
	return err
}


// ========== AGENT PERFORMANCE ==========

// AgentDailyStats estadísticas diarias del agente
type AgentDailyStats struct {
	ID                    int64   `json:"id"`
	AgentID               int64   `json:"agent_id"`
	Date                  string  `json:"date"`
	TicketsAssigned       int     `json:"tickets_assigned"`
	TicketsResolved       int     `json:"tickets_resolved"`
	TicketsEscalated      int     `json:"tickets_escalated"`
	ChatsHandled          int     `json:"chats_handled"`
	AvgResponseTimeMin    float64 `json:"avg_response_time_minutes"`
	AvgResolutionTimeMin  float64 `json:"avg_resolution_time_minutes"`
	SLAComplianceRate     float64 `json:"sla_compliance_rate"`
	AvgRating             float64 `json:"avg_rating"`
	RatingsCount          int     `json:"ratings_count"`
	OnlineTimeMin         int     `json:"online_time_minutes"`
}

// GetAgentPerformance obtiene estadísticas de rendimiento de un agente
func (r *SupportAgentRepository) GetAgentPerformance(ctx context.Context, agentID int64, days int) ([]*AgentDailyStats, error) {
	query := `
		SELECT id, agent_id, date::text, tickets_assigned, tickets_resolved, tickets_escalated,
			chats_handled, avg_response_time_minutes, avg_resolution_time_minutes,
			sla_compliance_rate, avg_rating, ratings_count, online_time_minutes
		FROM agent_daily_stats
		WHERE agent_id = $1 AND date >= CURRENT_DATE - $2::int
		ORDER BY date DESC
	`
	rows, err := r.pool.Query(ctx, query, agentID, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stats []*AgentDailyStats
	for rows.Next() {
		s := &AgentDailyStats{}
		if err := rows.Scan(&s.ID, &s.AgentID, &s.Date, &s.TicketsAssigned, &s.TicketsResolved,
			&s.TicketsEscalated, &s.ChatsHandled, &s.AvgResponseTimeMin, &s.AvgResolutionTimeMin,
			&s.SLAComplianceRate, &s.AvgRating, &s.RatingsCount, &s.OnlineTimeMin); err != nil {
			return nil, err
		}
		stats = append(stats, s)
	}
	return stats, nil
}

// GetTeamPerformance obtiene estadísticas de todo el equipo
func (r *SupportAgentRepository) GetTeamPerformance(ctx context.Context, days int) ([]*AgentDailyStats, error) {
	query := `
		SELECT 0 as id, 0 as agent_id, date::text,
			SUM(tickets_assigned)::int as tickets_assigned,
			SUM(tickets_resolved)::int as tickets_resolved,
			SUM(tickets_escalated)::int as tickets_escalated,
			SUM(chats_handled)::int as chats_handled,
			AVG(avg_response_time_minutes) as avg_response_time_minutes,
			AVG(avg_resolution_time_minutes) as avg_resolution_time_minutes,
			AVG(sla_compliance_rate) as sla_compliance_rate,
			AVG(avg_rating) as avg_rating,
			SUM(ratings_count)::int as ratings_count,
			SUM(online_time_minutes)::int as online_time_minutes
		FROM agent_daily_stats
		WHERE date >= CURRENT_DATE - $1::int
		GROUP BY date
		ORDER BY date DESC
	`
	rows, err := r.pool.Query(ctx, query, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stats []*AgentDailyStats
	for rows.Next() {
		s := &AgentDailyStats{}
		if err := rows.Scan(&s.ID, &s.AgentID, &s.Date, &s.TicketsAssigned, &s.TicketsResolved,
			&s.TicketsEscalated, &s.ChatsHandled, &s.AvgResponseTimeMin, &s.AvgResolutionTimeMin,
			&s.SLAComplianceRate, &s.AvgRating, &s.RatingsCount, &s.OnlineTimeMin); err != nil {
			return nil, err
		}
		stats = append(stats, s)
	}
	return stats, nil
}


// ========== SLA BREACHES ==========

// SLABreach incumplimiento de SLA
type SLABreach struct {
	ID                 int64      `json:"id"`
	TicketID           int64      `json:"ticket_id"`
	PolicyID           *int64     `json:"policy_id"`
	BreachType         string     `json:"breach_type"`
	ExpectedAt         time.Time  `json:"expected_at"`
	BreachedAt         time.Time  `json:"breached_at"`
	TimeExceededMin    int        `json:"time_exceeded_minutes"`
	AgentID            *int64     `json:"agent_id"`
	Acknowledged       bool       `json:"acknowledged"`
	AcknowledgedAt     *time.Time `json:"acknowledged_at"`
	AcknowledgedBy     *int64     `json:"acknowledged_by"`
	Notes              string     `json:"notes"`
	CreatedAt          time.Time  `json:"created_at"`
}

// GetSLABreaches obtiene incumplimientos de SLA
func (r *SupportAgentRepository) GetSLABreaches(ctx context.Context, acknowledged *bool, limit int) ([]*SLABreach, error) {
	query := `
		SELECT id, ticket_id, policy_id, breach_type, expected_at, breached_at,
			COALESCE(time_exceeded_minutes, 0) as time_exceeded_minutes, agent_id,
			acknowledged, acknowledged_at, acknowledged_by, COALESCE(notes, '') as notes, created_at
		FROM sla_breaches
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1

	if acknowledged != nil {
		query += fmt.Sprintf(" AND acknowledged = $%d", argNum)
		args = append(args, *acknowledged)
		argNum++
	}

	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var breaches []*SLABreach
	for rows.Next() {
		b := &SLABreach{}
		if err := rows.Scan(&b.ID, &b.TicketID, &b.PolicyID, &b.BreachType, &b.ExpectedAt,
			&b.BreachedAt, &b.TimeExceededMin, &b.AgentID, &b.Acknowledged, &b.AcknowledgedAt,
			&b.AcknowledgedBy, &b.Notes, &b.CreatedAt); err != nil {
			return nil, err
		}
		breaches = append(breaches, b)
	}
	return breaches, nil
}

// AcknowledgeSLABreach reconoce un incumplimiento de SLA
func (r *SupportAgentRepository) AcknowledgeSLABreach(ctx context.Context, breachID, agentID int64, notes string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE sla_breaches 
		SET acknowledged = true, acknowledged_at = NOW(), acknowledged_by = $2, notes = $3
		WHERE id = $1
	`, breachID, agentID, notes)
	return err
}

// GetUnacknowledgedBreachCount obtiene el conteo de incumplimientos no reconocidos
func (r *SupportAgentRepository) GetUnacknowledgedBreachCount(ctx context.Context) (int, error) {
	var count int
	err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM sla_breaches WHERE acknowledged = false").Scan(&count)
	return count, err
}


// ========== ACTIVITY LOGS ==========

// ActivityLog log de actividad
type ActivityLog struct {
	ID             int64     `json:"id"`
	AgentID        int64     `json:"agent_id"`
	Action         string    `json:"action"`
	ActionCategory string    `json:"action_category"`
	TargetType     string    `json:"target_type"`
	TargetID       *int64    `json:"target_id"`
	TargetName     string    `json:"target_name"`
	IPAddress      string    `json:"ip_address"`
	CreatedAt      time.Time `json:"created_at"`
}

// GetActivityLogs obtiene logs de actividad
func (r *SupportAgentRepository) GetActivityLogs(ctx context.Context, agentID *int64, category string, limit int) ([]*ActivityLog, error) {
	query := `
		SELECT id, agent_id, action, action_category, 
			COALESCE(target_type, '') as target_type, target_id,
			COALESCE(target_name, '') as target_name,
			COALESCE(ip_address, '') as ip_address, created_at
		FROM agent_activity_logs
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1

	if agentID != nil {
		query += fmt.Sprintf(" AND agent_id = $%d", argNum)
		args = append(args, *agentID)
		argNum++
	}
	if category != "" && category != "all" {
		query += fmt.Sprintf(" AND action_category = $%d", argNum)
		args = append(args, category)
		argNum++
	}

	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []*ActivityLog
	for rows.Next() {
		l := &ActivityLog{}
		if err := rows.Scan(&l.ID, &l.AgentID, &l.Action, &l.ActionCategory,
			&l.TargetType, &l.TargetID, &l.TargetName, &l.IPAddress, &l.CreatedAt); err != nil {
			return nil, err
		}
		logs = append(logs, l)
	}
	return logs, nil
}

// LogActivity registra una actividad
func (r *SupportAgentRepository) LogActivity(ctx context.Context, agentID int64, action, category, targetType string, targetID *int64, targetName, ipAddress string) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO agent_activity_logs (agent_id, action, action_category, target_type, target_id, target_name, ip_address)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, agentID, action, category, targetType, targetID, targetName, ipAddress)
	return err
}


// ========== ANNOUNCEMENTS ==========

// Announcement anuncio
type Announcement struct {
	ID        int64      `json:"id"`
	Title     string     `json:"title"`
	Content   string     `json:"content"`
	Type      string     `json:"type"`
	Priority  string     `json:"priority"`
	IsPinned  bool       `json:"is_pinned"`
	IsActive  bool       `json:"is_active"`
	CreatedBy *int64     `json:"created_by"`
	StartsAt  time.Time  `json:"starts_at"`
	ExpiresAt *time.Time `json:"expires_at"`
	CreatedAt time.Time  `json:"created_at"`
	IsRead    bool       `json:"is_read"`
}

// GetAnnouncements obtiene anuncios activos
func (r *SupportAgentRepository) GetAnnouncements(ctx context.Context, agentID int64) ([]*Announcement, error) {
	query := `
		SELECT a.id, a.title, a.content, a.type, a.priority, a.is_pinned, a.is_active,
			a.created_by, a.starts_at, a.expires_at, a.created_at,
			CASE WHEN ar.id IS NOT NULL THEN true ELSE false END as is_read
		FROM support_announcements a
		LEFT JOIN announcement_reads ar ON a.id = ar.announcement_id AND ar.agent_id = $1
		WHERE a.is_active = true 
			AND a.starts_at <= NOW() 
			AND (a.expires_at IS NULL OR a.expires_at > NOW())
		ORDER BY a.is_pinned DESC, a.priority DESC, a.created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, agentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var announcements []*Announcement
	for rows.Next() {
		a := &Announcement{}
		if err := rows.Scan(&a.ID, &a.Title, &a.Content, &a.Type, &a.Priority, &a.IsPinned,
			&a.IsActive, &a.CreatedBy, &a.StartsAt, &a.ExpiresAt, &a.CreatedAt, &a.IsRead); err != nil {
			return nil, err
		}
		announcements = append(announcements, a)
	}
	return announcements, nil
}

// CreateAnnouncement crea un anuncio
func (r *SupportAgentRepository) CreateAnnouncement(ctx context.Context, title, content, annType, priority string, isPinned bool, createdBy int64, expiresAt *time.Time) (*Announcement, error) {
	query := `
		INSERT INTO support_announcements (title, content, type, priority, is_pinned, created_by, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, starts_at, created_at
	`
	a := &Announcement{Title: title, Content: content, Type: annType, Priority: priority, IsPinned: isPinned, CreatedBy: &createdBy, ExpiresAt: expiresAt, IsActive: true}
	err := r.pool.QueryRow(ctx, query, title, content, annType, priority, isPinned, createdBy, expiresAt).Scan(&a.ID, &a.StartsAt, &a.CreatedAt)
	return a, err
}

// MarkAnnouncementRead marca un anuncio como leído
func (r *SupportAgentRepository) MarkAnnouncementRead(ctx context.Context, announcementID, agentID int64) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO announcement_reads (announcement_id, agent_id)
		VALUES ($1, $2)
		ON CONFLICT (announcement_id, agent_id) DO NOTHING
	`, announcementID, agentID)
	return err
}

// DeleteAnnouncement elimina un anuncio
func (r *SupportAgentRepository) DeleteAnnouncement(ctx context.Context, announcementID int64) error {
	_, err := r.pool.Exec(ctx, "UPDATE support_announcements SET is_active = false WHERE id = $1", announcementID)
	return err
}


// ========== FAQ CATEGORIES ==========

// FAQCategory categoría de FAQ
type FAQCategory struct {
	ID           int64  `json:"id"`
	Name         string `json:"name"`
	Slug         string `json:"slug"`
	Description  string `json:"description"`
	Icon         string `json:"icon"`
	DisplayOrder int    `json:"display_order"`
	IsActive     bool   `json:"is_active"`
	FAQCount     int    `json:"faq_count"`
}

// GetFAQCategories obtiene las categorías de FAQs
func (r *SupportAgentRepository) GetFAQCategories(ctx context.Context) ([]*FAQCategory, error) {
	query := `
		SELECT c.id, c.name, COALESCE(c.slug, '') as slug, 
			COALESCE(c.description, '') as description,
			COALESCE(c.icon, 'help-circle') as icon,
			COALESCE(c.display_order, 0) as display_order, c.is_active,
			COUNT(f.id)::int as faq_count
		FROM faq_categories c
		LEFT JOIN faq_articles f ON c.id = f.category_id AND f.is_published = true
		WHERE c.is_active = true
		GROUP BY c.id
		ORDER BY c.display_order ASC, c.name ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []*FAQCategory
	for rows.Next() {
		c := &FAQCategory{}
		if err := rows.Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.Icon,
			&c.DisplayOrder, &c.IsActive, &c.FAQCount); err != nil {
			return nil, err
		}
		categories = append(categories, c)
	}
	return categories, nil
}

// CreateFAQCategory crea una categoría de FAQ
func (r *SupportAgentRepository) CreateFAQCategory(ctx context.Context, name, slug, description, icon string, displayOrder int) (*FAQCategory, error) {
	if slug == "" {
		slug = fmt.Sprintf("%s-%d", name, time.Now().Unix())
	}
	query := `
		INSERT INTO faq_categories (name, slug, description, icon, display_order)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`
	c := &FAQCategory{Name: name, Slug: slug, Description: description, Icon: icon, DisplayOrder: displayOrder, IsActive: true}
	err := r.pool.QueryRow(ctx, query, name, slug, description, icon, displayOrder).Scan(&c.ID)
	return c, err
}

// UpdateFAQCategory actualiza una categoría de FAQ
func (r *SupportAgentRepository) UpdateFAQCategory(ctx context.Context, id int64, name, description, icon *string, displayOrder *int) error {
	query := "UPDATE faq_categories SET id = id"
	args := []interface{}{}
	argNum := 1

	if name != nil {
		query += fmt.Sprintf(", name = $%d", argNum)
		args = append(args, *name)
		argNum++
	}
	if description != nil {
		query += fmt.Sprintf(", description = $%d", argNum)
		args = append(args, *description)
		argNum++
	}
	if icon != nil {
		query += fmt.Sprintf(", icon = $%d", argNum)
		args = append(args, *icon)
		argNum++
	}
	if displayOrder != nil {
		query += fmt.Sprintf(", display_order = $%d", argNum)
		args = append(args, *displayOrder)
		argNum++
	}

	query += fmt.Sprintf(" WHERE id = $%d", argNum)
	args = append(args, id)

	_, err := r.pool.Exec(ctx, query, args...)
	return err
}

// DeleteFAQCategory elimina una categoría de FAQ
func (r *SupportAgentRepository) DeleteFAQCategory(ctx context.Context, id int64) error {
	_, err := r.pool.Exec(ctx, "UPDATE faq_categories SET is_active = false WHERE id = $1", id)
	return err
}

// ========== INTERNAL CHAT ROOMS ==========

// ChatRoom sala de chat interno
type ChatRoom struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	Type        string    `json:"type"`
	Description string    `json:"description"`
	IsActive    bool      `json:"is_active"`
	CreatedBy   int64     `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	MemberCount int       `json:"member_count"`
	UnreadCount int       `json:"unread_count"`
}

// ChatRoomMessage mensaje de sala de chat
type ChatRoomMessage struct {
	ID         int64     `json:"id"`
	RoomID     int64     `json:"room_id"`
	SenderID   int64     `json:"sender_id"`
	SenderName string    `json:"sender_name"`
	Message    string    `json:"message"`
	ReplyTo    *int64    `json:"reply_to"`
	IsEdited   bool      `json:"is_edited"`
	IsDeleted  bool      `json:"is_deleted"`
	IsPinned   bool      `json:"is_pinned"`
	CreatedAt  time.Time `json:"created_at"`
	Reactions  []string  `json:"reactions"`
}

// GetChatRooms obtiene las salas de chat
func (r *SupportAgentRepository) GetChatRooms(ctx context.Context, agentID int64) ([]*ChatRoom, error) {
	query := `
		SELECT r.id, r.name, r.type, COALESCE(r.description, '') as description,
			r.is_active, COALESCE(r.created_by, 0) as created_by, r.created_at,
			COUNT(DISTINCT m.agent_id)::int as member_count,
			0 as unread_count
		FROM internal_chat_rooms r
		LEFT JOIN internal_chat_members m ON r.id = m.room_id
		WHERE r.is_active = true
		GROUP BY r.id
		ORDER BY r.type, r.name
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rooms []*ChatRoom
	for rows.Next() {
		room := &ChatRoom{}
		if err := rows.Scan(&room.ID, &room.Name, &room.Type, &room.Description,
			&room.IsActive, &room.CreatedBy, &room.CreatedAt, &room.MemberCount, &room.UnreadCount); err != nil {
			return nil, err
		}
		rooms = append(rooms, room)
	}
	return rooms, nil
}

// CreateChatRoom crea una sala de chat
func (r *SupportAgentRepository) CreateChatRoom(ctx context.Context, name, roomType, description string, createdBy int64) (*ChatRoom, error) {
	query := `
		INSERT INTO internal_chat_rooms (name, type, description, created_by)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`
	room := &ChatRoom{Name: name, Type: roomType, Description: description, CreatedBy: createdBy, IsActive: true}
	err := r.pool.QueryRow(ctx, query, name, roomType, description, createdBy).Scan(&room.ID, &room.CreatedAt)
	if err != nil {
		return nil, err
	}
	// Agregar creador como admin
	r.pool.Exec(ctx, "INSERT INTO internal_chat_members (room_id, agent_id, role) VALUES ($1, $2, 'admin')", room.ID, createdBy)
	return room, nil
}

// GetChatRoomMessages obtiene mensajes de una sala
func (r *SupportAgentRepository) GetChatRoomMessages(ctx context.Context, roomID int64, limit int) ([]*ChatRoomMessage, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT m.id, m.room_id, m.sender_id, 
			COALESCE(u.first_name || ' ' || u.last_name, 'Sistema') as sender_name,
			m.message, m.reply_to, m.is_edited, m.is_deleted, m.is_pinned, m.created_at
		FROM internal_chat_room_messages m
		LEFT JOIN users u ON m.sender_id = u.id
		WHERE m.room_id = $1 AND m.is_deleted = false
		ORDER BY m.created_at DESC
		LIMIT $2
	`
	rows, err := r.pool.Query(ctx, query, roomID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*ChatRoomMessage
	for rows.Next() {
		msg := &ChatRoomMessage{}
		if err := rows.Scan(&msg.ID, &msg.RoomID, &msg.SenderID, &msg.SenderName,
			&msg.Message, &msg.ReplyTo, &msg.IsEdited, &msg.IsDeleted, &msg.IsPinned, &msg.CreatedAt); err != nil {
			return nil, err
		}
		messages = append(messages, msg)
	}
	return messages, nil
}

// SendChatRoomMessage envía mensaje a una sala
func (r *SupportAgentRepository) SendChatRoomMessage(ctx context.Context, roomID, senderID int64, message string, replyTo *int64) (*ChatRoomMessage, error) {
	query := `
		INSERT INTO internal_chat_room_messages (room_id, sender_id, message, reply_to)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`
	msg := &ChatRoomMessage{RoomID: roomID, SenderID: senderID, Message: message, ReplyTo: replyTo}
	err := r.pool.QueryRow(ctx, query, roomID, senderID, message, replyTo).Scan(&msg.ID, &msg.CreatedAt)
	return msg, err
}

// JoinChatRoom une a un agente a una sala
func (r *SupportAgentRepository) JoinChatRoom(ctx context.Context, roomID, agentID int64) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO internal_chat_members (room_id, agent_id, role)
		VALUES ($1, $2, 'member')
		ON CONFLICT (room_id, agent_id) DO NOTHING
	`, roomID, agentID)
	return err
}

// LeaveChatRoom saca a un agente de una sala
func (r *SupportAgentRepository) LeaveChatRoom(ctx context.Context, roomID, agentID int64) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM internal_chat_members WHERE room_id = $1 AND agent_id = $2", roomID, agentID)
	return err
}

// ========== CHAT REACTIONS ==========

// AddReaction agrega una reacción a un mensaje
func (r *SupportAgentRepository) AddReaction(ctx context.Context, messageID, agentID int64, emoji string) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO internal_chat_reactions (message_id, agent_id, emoji)
		VALUES ($1, $2, $3)
		ON CONFLICT (message_id, agent_id, emoji) DO NOTHING
	`, messageID, agentID, emoji)
	return err
}

// RemoveReaction elimina una reacción
func (r *SupportAgentRepository) RemoveReaction(ctx context.Context, messageID, agentID int64, emoji string) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM internal_chat_reactions WHERE message_id = $1 AND agent_id = $2 AND emoji = $3", messageID, agentID, emoji)
	return err
}

// ========== MENTIONS ==========

// GetUnreadMentions obtiene menciones no leídas
func (r *SupportAgentRepository) GetUnreadMentions(ctx context.Context, agentID int64) (int, error) {
	var count int
	err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM internal_chat_mentions WHERE mentioned_agent_id = $1 AND is_read = false", agentID).Scan(&count)
	return count, err
}

// MarkMentionsRead marca menciones como leídas
func (r *SupportAgentRepository) MarkMentionsRead(ctx context.Context, agentID int64) error {
	_, err := r.pool.Exec(ctx, "UPDATE internal_chat_mentions SET is_read = true WHERE mentioned_agent_id = $1", agentID)
	return err
}

// ========== AGENT SESSIONS ==========

// AgentSession sesión del agente
type AgentSession struct {
	ID           int64     `json:"id"`
	AgentID      int64     `json:"agent_id"`
	Device       string    `json:"device"`
	IPAddress    string    `json:"ip_address"`
	Location     string    `json:"location"`
	IsCurrent    bool      `json:"is_current"`
	LastActiveAt time.Time `json:"last_active_at"`
	CreatedAt    time.Time `json:"created_at"`
	ExpiresAt    time.Time `json:"expires_at"`
}

// GetAgentSessions obtiene sesiones activas del agente
func (r *SupportAgentRepository) GetAgentSessions(ctx context.Context, agentID int64) ([]*AgentSession, error) {
	query := `
		SELECT id, agent_id, COALESCE(device, '') as device, COALESCE(ip_address, '') as ip_address,
			COALESCE(location, '') as location, is_current, last_active_at, created_at, 
			COALESCE(expires_at, NOW() + INTERVAL '24 hours') as expires_at
		FROM support_agent_sessions
		WHERE agent_id = $1 AND (expires_at IS NULL OR expires_at > NOW())
		ORDER BY last_active_at DESC
	`
	rows, err := r.pool.Query(ctx, query, agentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []*AgentSession
	for rows.Next() {
		s := &AgentSession{}
		if err := rows.Scan(&s.ID, &s.AgentID, &s.Device, &s.IPAddress, &s.Location,
			&s.IsCurrent, &s.LastActiveAt, &s.CreatedAt, &s.ExpiresAt); err != nil {
			return nil, err
		}
		sessions = append(sessions, s)
	}
	return sessions, nil
}

// InvalidateAgentSession invalida una sesión
func (r *SupportAgentRepository) InvalidateAgentSession(ctx context.Context, sessionID, agentID int64) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM support_agent_sessions WHERE id = $1 AND agent_id = $2", sessionID, agentID)
	return err
}

// InvalidateAllAgentSessions invalida todas las sesiones excepto la actual
func (r *SupportAgentRepository) InvalidateAllAgentSessions(ctx context.Context, agentID int64) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM support_agent_sessions WHERE agent_id = $1 AND is_current = false", agentID)
	return err
}

// ========== LOGIN HISTORY ==========

// LoginHistoryEntry entrada del historial de login
type LoginHistoryEntry struct {
	ID            int64     `json:"id"`
	AgentID       int64     `json:"agent_id"`
	IPAddress     string    `json:"ip_address"`
	Device        string    `json:"device"`
	Location      string    `json:"location"`
	Status        string    `json:"status"`
	FailureReason string    `json:"failure_reason"`
	IsCurrent     bool      `json:"is_current"`
	CreatedAt     time.Time `json:"created_at"`
}

// GetAgentLoginHistory obtiene historial de login
func (r *SupportAgentRepository) GetAgentLoginHistory(ctx context.Context, agentID int64, limit int) ([]*LoginHistoryEntry, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT id, agent_id, COALESCE(ip_address, '') as ip_address, COALESCE(device, '') as device,
			COALESCE(location, '') as location, status, COALESCE(failure_reason, '') as failure_reason,
			is_current, created_at
		FROM agent_login_history
		WHERE agent_id = $1
		ORDER BY created_at DESC
		LIMIT $2
	`
	rows, err := r.pool.Query(ctx, query, agentID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []*LoginHistoryEntry
	for rows.Next() {
		h := &LoginHistoryEntry{}
		if err := rows.Scan(&h.ID, &h.AgentID, &h.IPAddress, &h.Device, &h.Location,
			&h.Status, &h.FailureReason, &h.IsCurrent, &h.CreatedAt); err != nil {
			return nil, err
		}
		history = append(history, h)
	}
	return history, nil
}

// ========== API TOKENS ==========

// APIToken token de API
type APIToken struct {
	ID          int64      `json:"id"`
	AgentID     int64      `json:"agent_id"`
	Name        string     `json:"name"`
	TokenPrefix string     `json:"token_prefix"`
	Permissions []string   `json:"permissions"`
	LastUsedAt  *time.Time `json:"last_used_at"`
	ExpiresAt   *time.Time `json:"expires_at"`
	IsActive    bool       `json:"is_active"`
	CreatedAt   time.Time  `json:"created_at"`
}

// GetAPITokens obtiene tokens del agente
func (r *SupportAgentRepository) GetAPITokens(ctx context.Context, agentID int64) ([]*APIToken, error) {
	query := `
		SELECT id, agent_id, name, COALESCE(token_prefix, '') as token_prefix,
			COALESCE(permissions, '[]')::text as permissions, last_used_at, expires_at, is_active, created_at
		FROM agent_api_tokens
		WHERE agent_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, agentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tokens []*APIToken
	for rows.Next() {
		t := &APIToken{}
		var perms string
		if err := rows.Scan(&t.ID, &t.AgentID, &t.Name, &t.TokenPrefix, &perms,
			&t.LastUsedAt, &t.ExpiresAt, &t.IsActive, &t.CreatedAt); err != nil {
			return nil, err
		}
		tokens = append(tokens, t)
	}
	return tokens, nil
}

// CreateAPIToken crea un token de API
func (r *SupportAgentRepository) CreateAPIToken(ctx context.Context, agentID int64, name, tokenHash, tokenPrefix string, permissions []string) (*APIToken, error) {
	query := `
		INSERT INTO agent_api_tokens (agent_id, name, token_hash, token_prefix, permissions)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at
	`
	t := &APIToken{AgentID: agentID, Name: name, TokenPrefix: tokenPrefix, Permissions: permissions, IsActive: true}
	err := r.pool.QueryRow(ctx, query, agentID, name, tokenHash, tokenPrefix, permissions).Scan(&t.ID, &t.CreatedAt)
	return t, err
}

// RevokeAPIToken revoca un token
func (r *SupportAgentRepository) RevokeAPIToken(ctx context.Context, tokenID, agentID int64) error {
	_, err := r.pool.Exec(ctx, "UPDATE agent_api_tokens SET is_active = false WHERE id = $1 AND agent_id = $2", tokenID, agentID)
	return err
}

// ========== WEBHOOKS ==========

// Webhook webhook configurado
type Webhook struct {
	ID              int64      `json:"id"`
	AgentID         int64      `json:"agent_id"`
	URL             string     `json:"url"`
	Events          []string   `json:"events"`
	IsActive        bool       `json:"is_active"`
	LastTriggeredAt *time.Time `json:"last_triggered_at"`
	FailureCount    int        `json:"failure_count"`
	CreatedAt       time.Time  `json:"created_at"`
}

// GetWebhooks obtiene webhooks del agente
func (r *SupportAgentRepository) GetWebhooks(ctx context.Context, agentID int64) ([]*Webhook, error) {
	query := `
		SELECT id, agent_id, url, COALESCE(events, '[]')::text as events, is_active,
			last_triggered_at, failure_count, created_at
		FROM agent_webhooks
		WHERE agent_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, agentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var webhooks []*Webhook
	for rows.Next() {
		w := &Webhook{}
		var events string
		if err := rows.Scan(&w.ID, &w.AgentID, &w.URL, &events, &w.IsActive,
			&w.LastTriggeredAt, &w.FailureCount, &w.CreatedAt); err != nil {
			return nil, err
		}
		webhooks = append(webhooks, w)
	}
	return webhooks, nil
}

// CreateWebhook crea un webhook
func (r *SupportAgentRepository) CreateWebhook(ctx context.Context, agentID int64, url string, events []string, secret string) (*Webhook, error) {
	query := `
		INSERT INTO agent_webhooks (agent_id, url, events, secret)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`
	w := &Webhook{AgentID: agentID, URL: url, Events: events, IsActive: true}
	err := r.pool.QueryRow(ctx, query, agentID, url, events, secret).Scan(&w.ID, &w.CreatedAt)
	return w, err
}

// DeleteWebhook elimina un webhook
func (r *SupportAgentRepository) DeleteWebhook(ctx context.Context, webhookID, agentID int64) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM agent_webhooks WHERE id = $1 AND agent_id = $2", webhookID, agentID)
	return err
}

// ========== GLOBAL SEARCH ==========

// SearchResult resultado de búsqueda
type SearchResult struct {
	EntityType string `json:"entity_type"`
	EntityID   int64  `json:"entity_id"`
	Title      string `json:"title"`
	Content    string `json:"content"`
	Score      float64 `json:"score"`
}

// GlobalSearch búsqueda global
func (r *SupportAgentRepository) GlobalSearch(ctx context.Context, query string, entityTypes []string, limit int) ([]*SearchResult, error) {
	if limit <= 0 {
		limit = 20
	}
	searchQuery := `
		SELECT entity_type, entity_id, COALESCE(title, '') as title, 
			LEFT(COALESCE(content, ''), 200) as content, 1.0 as score
		FROM search_index
		WHERE (title ILIKE $1 OR content ILIKE $1)
		ORDER BY updated_at DESC
		LIMIT $2
	`
	rows, err := r.pool.Query(ctx, searchQuery, "%"+query+"%", limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []*SearchResult
	for rows.Next() {
		sr := &SearchResult{}
		if err := rows.Scan(&sr.EntityType, &sr.EntityID, &sr.Title, &sr.Content, &sr.Score); err != nil {
			return nil, err
		}
		results = append(results, sr)
	}
	return results, nil
}

// SaveSearchHistory guarda historial de búsqueda
func (r *SupportAgentRepository) SaveSearchHistory(ctx context.Context, agentID int64, query string, resultsCount int) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO search_history (agent_id, query, results_count)
		VALUES ($1, $2, $3)
	`, agentID, query, resultsCount)
	return err
}

// ========== KEYBOARD SHORTCUTS ==========

// KeyboardShortcut atajo de teclado
type KeyboardShortcut struct {
	ID          int64  `json:"id"`
	AgentID     int64  `json:"agent_id"`
	Action      string `json:"action"`
	Description string `json:"description"`
	Keys        string `json:"keys"`
	IsCustom    bool   `json:"is_custom"`
	IsActive    bool   `json:"is_active"`
}

// GetKeyboardShortcuts obtiene atajos del agente
func (r *SupportAgentRepository) GetKeyboardShortcuts(ctx context.Context, agentID int64) ([]*KeyboardShortcut, error) {
	query := `
		SELECT COALESCE(k.id, 0) as id, $1::int as agent_id, d.action, 
			COALESCE(d.description, '') as description,
			COALESCE(k.keys, d.keys) as keys, COALESCE(k.is_custom, false) as is_custom,
			COALESCE(k.is_active, true) as is_active
		FROM default_shortcuts d
		LEFT JOIN keyboard_shortcuts k ON d.action = k.action AND k.agent_id = $1
		ORDER BY d.action
	`
	rows, err := r.pool.Query(ctx, query, agentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var shortcuts []*KeyboardShortcut
	for rows.Next() {
		s := &KeyboardShortcut{}
		if err := rows.Scan(&s.ID, &s.AgentID, &s.Action, &s.Description, &s.Keys, &s.IsCustom, &s.IsActive); err != nil {
			return nil, err
		}
		shortcuts = append(shortcuts, s)
	}
	return shortcuts, nil
}

// UpdateKeyboardShortcut actualiza un atajo
func (r *SupportAgentRepository) UpdateKeyboardShortcut(ctx context.Context, agentID int64, action, keys string) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO keyboard_shortcuts (agent_id, action, keys, is_custom)
		VALUES ($1, $2, $3, true)
		ON CONFLICT (agent_id, action) DO UPDATE SET keys = $3, is_custom = true, updated_at = NOW()
	`, agentID, action, keys)
	return err
}

// ResetKeyboardShortcut resetea un atajo al valor por defecto
func (r *SupportAgentRepository) ResetKeyboardShortcut(ctx context.Context, agentID int64, action string) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM keyboard_shortcuts WHERE agent_id = $1 AND action = $2", agentID, action)
	return err
}

// ========== VIDEO CALLS ==========

// VideoCall videollamada de soporte
type VideoCall struct {
	ID              int64      `json:"id"`
	TicketID        *int64     `json:"ticket_id"`
	UserID          int64      `json:"user_id"`
	UserName        string     `json:"user_name"`
	AgentID         int64      `json:"agent_id"`
	ScheduledAt     time.Time  `json:"scheduled_at"`
	DurationMinutes int        `json:"duration_minutes"`
	MeetingURL      string     `json:"meeting_url"`
	Status          string     `json:"status"`
	Notes           string     `json:"notes"`
	StartedAt       *time.Time `json:"started_at"`
	EndedAt         *time.Time `json:"ended_at"`
	CreatedAt       time.Time  `json:"created_at"`
}

// GetVideoCalls obtiene videollamadas del agente
func (r *SupportAgentRepository) GetVideoCalls(ctx context.Context, agentID int64, status string) ([]*VideoCall, error) {
	query := `
		SELECT v.id, v.ticket_id, v.user_id, 
			COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			v.agent_id, v.scheduled_at, v.duration_minutes, COALESCE(v.meeting_url, '') as meeting_url,
			v.status, COALESCE(v.notes, '') as notes, v.started_at, v.ended_at, v.created_at
		FROM support_video_calls v
		LEFT JOIN users u ON v.user_id = u.id
		WHERE v.agent_id = $1
	`
	args := []interface{}{agentID}
	if status != "" && status != "all" {
		query += " AND v.status = $2"
		args = append(args, status)
	}
	query += " ORDER BY v.scheduled_at DESC LIMIT 50"

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var calls []*VideoCall
	for rows.Next() {
		c := &VideoCall{}
		if err := rows.Scan(&c.ID, &c.TicketID, &c.UserID, &c.UserName, &c.AgentID,
			&c.ScheduledAt, &c.DurationMinutes, &c.MeetingURL, &c.Status, &c.Notes,
			&c.StartedAt, &c.EndedAt, &c.CreatedAt); err != nil {
			return nil, err
		}
		calls = append(calls, c)
	}
	return calls, nil
}

// ScheduleVideoCall programa una videollamada
func (r *SupportAgentRepository) ScheduleVideoCall(ctx context.Context, ticketID *int64, userID, agentID int64, scheduledAt time.Time, duration int, meetingURL string) (*VideoCall, error) {
	query := `
		INSERT INTO support_video_calls (ticket_id, user_id, agent_id, scheduled_at, duration_minutes, meeting_url)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at
	`
	c := &VideoCall{TicketID: ticketID, UserID: userID, AgentID: agentID, ScheduledAt: scheduledAt, DurationMinutes: duration, MeetingURL: meetingURL, Status: "scheduled"}
	err := r.pool.QueryRow(ctx, query, ticketID, userID, agentID, scheduledAt, duration, meetingURL).Scan(&c.ID, &c.CreatedAt)
	return c, err
}

// UpdateVideoCallStatus actualiza estado de videollamada
func (r *SupportAgentRepository) UpdateVideoCallStatus(ctx context.Context, callID int64, status string) error {
	query := "UPDATE support_video_calls SET status = $1"
	if status == "in_progress" {
		query += ", started_at = NOW()"
	} else if status == "completed" || status == "cancelled" || status == "no_show" {
		query += ", ended_at = NOW()"
	}
	query += " WHERE id = $2"
	_, err := r.pool.Exec(ctx, query, status, callID)
	return err
}

// ========== AI SUGGESTIONS ==========

// AISuggestion sugerencia de IA
type AISuggestion struct {
	ID                int64      `json:"id"`
	TicketID          int64      `json:"ticket_id"`
	SuggestedResponse string     `json:"suggested_response"`
	Confidence        float64    `json:"confidence"`
	WasUsed           bool       `json:"was_used"`
	WasModified       bool       `json:"was_modified"`
	CreatedAt         time.Time  `json:"created_at"`
}

// GetAISuggestions obtiene sugerencias de IA para un ticket
func (r *SupportAgentRepository) GetAISuggestions(ctx context.Context, ticketID int64) ([]*AISuggestion, error) {
	query := `
		SELECT id, ticket_id, suggested_response, confidence, was_used, was_modified, created_at
		FROM ai_response_suggestions
		WHERE ticket_id = $1
		ORDER BY created_at DESC
		LIMIT 5
	`
	rows, err := r.pool.Query(ctx, query, ticketID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var suggestions []*AISuggestion
	for rows.Next() {
		s := &AISuggestion{}
		if err := rows.Scan(&s.ID, &s.TicketID, &s.SuggestedResponse, &s.Confidence, &s.WasUsed, &s.WasModified, &s.CreatedAt); err != nil {
			return nil, err
		}
		suggestions = append(suggestions, s)
	}
	return suggestions, nil
}

// MarkAISuggestionUsed marca una sugerencia como usada
func (r *SupportAgentRepository) MarkAISuggestionUsed(ctx context.Context, suggestionID, agentID int64, wasModified bool) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE ai_response_suggestions 
		SET was_used = true, was_modified = $1, agent_id = $2, used_at = NOW()
		WHERE id = $3
	`, wasModified, agentID, suggestionID)
	return err
}

// ========== ROLES & PERMISSIONS ==========

// SupportRole rol de soporte
type SupportRole struct {
	ID          int64    `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Permissions []string `json:"permissions"`
	IsActive    bool     `json:"is_active"`
}

// GetSupportRoles obtiene roles de soporte
func (r *SupportAgentRepository) GetSupportRoles(ctx context.Context) ([]*SupportRole, error) {
	query := `SELECT id, name, COALESCE(description, '') as description, COALESCE(permissions, '[]')::text as permissions, is_active FROM support_roles WHERE is_active = true ORDER BY name`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roles []*SupportRole
	for rows.Next() {
		role := &SupportRole{}
		var perms string
		if err := rows.Scan(&role.ID, &role.Name, &role.Description, &perms, &role.IsActive); err != nil {
			return nil, err
		}
		roles = append(roles, role)
	}
	return roles, nil
}

// GetAgentRoles obtiene roles asignados a un agente
func (r *SupportAgentRepository) GetAgentRoles(ctx context.Context, agentID int64) ([]*SupportRole, error) {
	query := `
		SELECT r.id, r.name, COALESCE(r.description, '') as description, COALESCE(r.permissions, '[]')::text as permissions, r.is_active
		FROM support_roles r
		INNER JOIN agent_roles ar ON r.id = ar.role_id
		WHERE ar.agent_id = $1 AND r.is_active = true
	`
	rows, err := r.pool.Query(ctx, query, agentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roles []*SupportRole
	for rows.Next() {
		role := &SupportRole{}
		var perms string
		if err := rows.Scan(&role.ID, &role.Name, &role.Description, &perms, &role.IsActive); err != nil {
			return nil, err
		}
		roles = append(roles, role)
	}
	return roles, nil
}

// AssignRole asigna un rol a un agente
func (r *SupportAgentRepository) AssignRole(ctx context.Context, agentID, roleID, assignedBy int64) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO agent_roles (agent_id, role_id, assigned_by)
		VALUES ($1, $2, $3)
		ON CONFLICT (agent_id, role_id) DO NOTHING
	`, agentID, roleID, assignedBy)
	return err
}

// RemoveRole remueve un rol de un agente
func (r *SupportAgentRepository) RemoveRole(ctx context.Context, agentID, roleID int64) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM agent_roles WHERE agent_id = $1 AND role_id = $2", agentID, roleID)
	return err
}

// SupportPermission permiso de soporte
type SupportPermission struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Code        string `json:"code"`
	Category    string `json:"category"`
	Description string `json:"description"`
}

// GetSupportPermissions obtiene todos los permisos
func (r *SupportAgentRepository) GetSupportPermissions(ctx context.Context) ([]*SupportPermission, error) {
	query := `SELECT id, name, code, COALESCE(category, '') as category, COALESCE(description, '') as description FROM support_permissions WHERE is_active = true ORDER BY category, name`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var perms []*SupportPermission
	for rows.Next() {
		p := &SupportPermission{}
		if err := rows.Scan(&p.ID, &p.Name, &p.Code, &p.Category, &p.Description); err != nil {
			return nil, err
		}
		perms = append(perms, p)
	}
	return perms, nil
}

// ========== AUTO ASSIGNMENT RULES ==========

// AutoAssignmentRule regla de asignación automática
type AutoAssignmentRule struct {
	ID             int64     `json:"id"`
	Name           string    `json:"name"`
	Conditions     string    `json:"conditions"`
	AssignmentType string    `json:"assignment_type"`
	TargetAgents   string    `json:"target_agents"`
	Priority       int       `json:"priority"`
	IsActive       bool      `json:"is_active"`
	CreatedAt      time.Time `json:"created_at"`
}

// GetAutoAssignmentRules obtiene reglas de asignación
func (r *SupportAgentRepository) GetAutoAssignmentRules(ctx context.Context) ([]*AutoAssignmentRule, error) {
	query := `
		SELECT id, name, COALESCE(conditions, '{}')::text as conditions, assignment_type,
			COALESCE(target_agents, '[]')::text as target_agents, priority, is_active, created_at
		FROM auto_assignment_rules
		ORDER BY priority DESC, name
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rules []*AutoAssignmentRule
	for rows.Next() {
		rule := &AutoAssignmentRule{}
		if err := rows.Scan(&rule.ID, &rule.Name, &rule.Conditions, &rule.AssignmentType,
			&rule.TargetAgents, &rule.Priority, &rule.IsActive, &rule.CreatedAt); err != nil {
			return nil, err
		}
		rules = append(rules, rule)
	}
	return rules, nil
}

// CreateAutoAssignmentRule crea una regla
func (r *SupportAgentRepository) CreateAutoAssignmentRule(ctx context.Context, name, conditions, assignmentType, targetAgents string, priority int) (*AutoAssignmentRule, error) {
	query := `
		INSERT INTO auto_assignment_rules (name, conditions, assignment_type, target_agents, priority)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at
	`
	rule := &AutoAssignmentRule{Name: name, Conditions: conditions, AssignmentType: assignmentType, TargetAgents: targetAgents, Priority: priority, IsActive: true}
	err := r.pool.QueryRow(ctx, query, name, conditions, assignmentType, targetAgents, priority).Scan(&rule.ID, &rule.CreatedAt)
	return rule, err
}

// ToggleAutoAssignmentRule activa/desactiva una regla
func (r *SupportAgentRepository) ToggleAutoAssignmentRule(ctx context.Context, ruleID int64) error {
	_, err := r.pool.Exec(ctx, "UPDATE auto_assignment_rules SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1", ruleID)
	return err
}

// DeleteAutoAssignmentRule elimina una regla
func (r *SupportAgentRepository) DeleteAutoAssignmentRule(ctx context.Context, ruleID int64) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM auto_assignment_rules WHERE id = $1", ruleID)
	return err
}

// AgentWorkload carga de trabajo del agente
type AgentWorkload struct {
	ID             int64 `json:"id"`
	AgentID        int64 `json:"agent_id"`
	ActiveTickets  int   `json:"active_tickets"`
	ActiveChats    int   `json:"active_chats"`
	MaxTickets     int   `json:"max_tickets"`
	MaxChats       int   `json:"max_chats"`
	IsAcceptingNew bool  `json:"is_accepting_new"`
}

// GetAgentWorkload obtiene carga de trabajo
func (r *SupportAgentRepository) GetAgentWorkload(ctx context.Context, agentID int64) (*AgentWorkload, error) {
	query := `
		SELECT id, agent_id, active_tickets, active_chats, max_tickets, max_chats, is_accepting_new
		FROM agent_workload WHERE agent_id = $1
	`
	w := &AgentWorkload{}
	err := r.pool.QueryRow(ctx, query, agentID).Scan(&w.ID, &w.AgentID, &w.ActiveTickets, &w.ActiveChats, &w.MaxTickets, &w.MaxChats, &w.IsAcceptingNew)
	if err != nil {
		// Crear registro si no existe
		w = &AgentWorkload{AgentID: agentID, MaxTickets: 10, MaxChats: 3, IsAcceptingNew: true}
		r.pool.Exec(ctx, "INSERT INTO agent_workload (agent_id) VALUES ($1) ON CONFLICT DO NOTHING", agentID)
	}
	return w, nil
}

// UpdateAgentWorkload actualiza carga de trabajo
func (r *SupportAgentRepository) UpdateAgentWorkload(ctx context.Context, agentID int64, maxTickets, maxChats *int, isAcceptingNew *bool) error {
	query := "UPDATE agent_workload SET updated_at = NOW()"
	args := []interface{}{}
	argNum := 1

	if maxTickets != nil {
		query += fmt.Sprintf(", max_tickets = $%d", argNum)
		args = append(args, *maxTickets)
		argNum++
	}
	if maxChats != nil {
		query += fmt.Sprintf(", max_chats = $%d", argNum)
		args = append(args, *maxChats)
		argNum++
	}
	if isAcceptingNew != nil {
		query += fmt.Sprintf(", is_accepting_new = $%d", argNum)
		args = append(args, *isAcceptingNew)
		argNum++
	}

	query += fmt.Sprintf(" WHERE agent_id = $%d", argNum)
	args = append(args, agentID)

	_, err := r.pool.Exec(ctx, query, args...)
	return err
}

// ========== DATA EXPORTS ==========

// DataExport exportación de datos
type DataExport struct {
	ID           int64      `json:"id"`
	AgentID      int64      `json:"agent_id"`
	ExportType   string     `json:"export_type"`
	Filters      string     `json:"filters"`
	Format       string     `json:"format"`
	FileURL      string     `json:"file_url"`
	FileSize     int        `json:"file_size"`
	RowCount     int        `json:"row_count"`
	Status       string     `json:"status"`
	ErrorMessage string     `json:"error_message"`
	CreatedAt    time.Time  `json:"created_at"`
	CompletedAt  *time.Time `json:"completed_at"`
}

// GetDataExports obtiene exportaciones del agente
func (r *SupportAgentRepository) GetDataExports(ctx context.Context, agentID int64) ([]*DataExport, error) {
	query := `
		SELECT id, agent_id, export_type, COALESCE(filters, '{}')::text as filters, format,
			COALESCE(file_url, '') as file_url, COALESCE(file_size, 0) as file_size,
			COALESCE(row_count, 0) as row_count, status, COALESCE(error_message, '') as error_message,
			created_at, completed_at
		FROM data_exports
		WHERE agent_id = $1
		ORDER BY created_at DESC
		LIMIT 20
	`
	rows, err := r.pool.Query(ctx, query, agentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var exports []*DataExport
	for rows.Next() {
		e := &DataExport{}
		if err := rows.Scan(&e.ID, &e.AgentID, &e.ExportType, &e.Filters, &e.Format,
			&e.FileURL, &e.FileSize, &e.RowCount, &e.Status, &e.ErrorMessage,
			&e.CreatedAt, &e.CompletedAt); err != nil {
			return nil, err
		}
		exports = append(exports, e)
	}
	return exports, nil
}

// CreateDataExport crea una solicitud de exportación
func (r *SupportAgentRepository) CreateDataExport(ctx context.Context, agentID int64, exportType, filters, format string) (*DataExport, error) {
	query := `
		INSERT INTO data_exports (agent_id, export_type, filters, format, expires_at)
		VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')
		RETURNING id, created_at
	`
	e := &DataExport{AgentID: agentID, ExportType: exportType, Filters: filters, Format: format, Status: "pending"}
	err := r.pool.QueryRow(ctx, query, agentID, exportType, filters, format).Scan(&e.ID, &e.CreatedAt)
	return e, err
}

// ========== CSAT/NPS SURVEYS ==========

// CSATSurvey encuesta CSAT
type CSATSurvey struct {
	ID                    int64     `json:"id"`
	TicketID              *int64    `json:"ticket_id"`
	UserID                int64     `json:"user_id"`
	AgentID               int64     `json:"agent_id"`
	OverallRating         int       `json:"overall_rating"`
	ResponseTimeRating    int       `json:"response_time_rating"`
	ResolutionRating      int       `json:"resolution_rating"`
	ProfessionalismRating int       `json:"professionalism_rating"`
	WouldRecommend        bool      `json:"would_recommend"`
	Feedback              string    `json:"feedback"`
	CreatedAt             time.Time `json:"created_at"`
}

// GetCSATSurveys obtiene encuestas CSAT
func (r *SupportAgentRepository) GetCSATSurveys(ctx context.Context, agentID *int64, limit int) ([]*CSATSurvey, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT id, ticket_id, user_id, agent_id, COALESCE(overall_rating, 0) as overall_rating,
			COALESCE(response_time_rating, 0) as response_time_rating,
			COALESCE(resolution_rating, 0) as resolution_rating,
			COALESCE(professionalism_rating, 0) as professionalism_rating,
			COALESCE(would_recommend, false) as would_recommend,
			COALESCE(feedback, '') as feedback, created_at
		FROM csat_surveys
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if agentID != nil {
		query += fmt.Sprintf(" AND agent_id = $%d", argNum)
		args = append(args, *agentID)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var surveys []*CSATSurvey
	for rows.Next() {
		s := &CSATSurvey{}
		if err := rows.Scan(&s.ID, &s.TicketID, &s.UserID, &s.AgentID, &s.OverallRating,
			&s.ResponseTimeRating, &s.ResolutionRating, &s.ProfessionalismRating,
			&s.WouldRecommend, &s.Feedback, &s.CreatedAt); err != nil {
			return nil, err
		}
		surveys = append(surveys, s)
	}
	return surveys, nil
}

// NPSScore puntuación NPS
type NPSScore struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"user_id"`
	Score     int       `json:"score"`
	Feedback  string    `json:"feedback"`
	Source    string    `json:"source"`
	CreatedAt time.Time `json:"created_at"`
}

// GetNPSScores obtiene puntuaciones NPS
func (r *SupportAgentRepository) GetNPSScores(ctx context.Context, limit int) ([]*NPSScore, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT id, user_id, score, COALESCE(feedback, '') as feedback, source, created_at
		FROM nps_scores
		ORDER BY created_at DESC
		LIMIT $1
	`
	rows, err := r.pool.Query(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var scores []*NPSScore
	for rows.Next() {
		s := &NPSScore{}
		if err := rows.Scan(&s.ID, &s.UserID, &s.Score, &s.Feedback, &s.Source, &s.CreatedAt); err != nil {
			return nil, err
		}
		scores = append(scores, s)
	}
	return scores, nil
}

// GetNPSSummary obtiene resumen de NPS
func (r *SupportAgentRepository) GetNPSSummary(ctx context.Context) (map[string]interface{}, error) {
	query := `
		SELECT 
			COUNT(*) as total,
			COUNT(*) FILTER (WHERE score >= 9) as promoters,
			COUNT(*) FILTER (WHERE score >= 7 AND score <= 8) as passives,
			COUNT(*) FILTER (WHERE score <= 6) as detractors,
			COALESCE(AVG(score), 0) as avg_score
		FROM nps_scores
		WHERE created_at > NOW() - INTERVAL '30 days'
	`
	var total, promoters, passives, detractors int
	var avgScore float64
	err := r.pool.QueryRow(ctx, query).Scan(&total, &promoters, &passives, &detractors, &avgScore)
	if err != nil {
		return nil, err
	}

	npsScore := 0.0
	if total > 0 {
		npsScore = (float64(promoters) - float64(detractors)) / float64(total) * 100
	}

	return map[string]interface{}{
		"total":      total,
		"promoters":  promoters,
		"passives":   passives,
		"detractors": detractors,
		"avg_score":  avgScore,
		"nps_score":  npsScore,
	}, nil
}

// ========== SAVED FILTERS ==========

// SavedFilter filtro guardado
type SavedFilter struct {
	ID         int64     `json:"id"`
	AgentID    int64     `json:"agent_id"`
	Name       string    `json:"name"`
	Filters    string    `json:"filters"`
	IsDefault  bool      `json:"is_default"`
	IsShared   bool      `json:"is_shared"`
	UsageCount int       `json:"usage_count"`
	CreatedAt  time.Time `json:"created_at"`
}

// GetSavedFilters obtiene filtros guardados
func (r *SupportAgentRepository) GetSavedFilters(ctx context.Context, agentID int64) ([]*SavedFilter, error) {
	query := `
		SELECT id, agent_id, name, filters::text, is_default, is_shared, usage_count, created_at
		FROM saved_ticket_filters
		WHERE agent_id = $1 OR is_shared = true
		ORDER BY usage_count DESC, name
	`
	rows, err := r.pool.Query(ctx, query, agentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var filters []*SavedFilter
	for rows.Next() {
		f := &SavedFilter{}
		if err := rows.Scan(&f.ID, &f.AgentID, &f.Name, &f.Filters, &f.IsDefault, &f.IsShared, &f.UsageCount, &f.CreatedAt); err != nil {
			return nil, err
		}
		filters = append(filters, f)
	}
	return filters, nil
}

// CreateSavedFilter crea un filtro guardado
func (r *SupportAgentRepository) CreateSavedFilter(ctx context.Context, agentID int64, name, filters string, isDefault, isShared bool) (*SavedFilter, error) {
	query := `
		INSERT INTO saved_ticket_filters (agent_id, name, filters, is_default, is_shared)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at
	`
	f := &SavedFilter{AgentID: agentID, Name: name, Filters: filters, IsDefault: isDefault, IsShared: isShared}
	err := r.pool.QueryRow(ctx, query, agentID, name, filters, isDefault, isShared).Scan(&f.ID, &f.CreatedAt)
	return f, err
}

// DeleteSavedFilter elimina un filtro guardado
func (r *SupportAgentRepository) DeleteSavedFilter(ctx context.Context, filterID, agentID int64) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM saved_ticket_filters WHERE id = $1 AND agent_id = $2", filterID, agentID)
	return err
}

// IncrementFilterUsage incrementa uso de filtro
func (r *SupportAgentRepository) IncrementFilterUsage(ctx context.Context, filterID int64) error {
	_, err := r.pool.Exec(ctx, "UPDATE saved_ticket_filters SET usage_count = usage_count + 1, updated_at = NOW() WHERE id = $1", filterID)
	return err
}

// ========== DASHBOARD WIDGETS ==========

// DashboardWidget widget del dashboard
type DashboardWidget struct {
	ID         int64  `json:"id"`
	AgentID    int64  `json:"agent_id"`
	WidgetType string `json:"widget_type"`
	Title      string `json:"title"`
	PositionX  int    `json:"position_x"`
	PositionY  int    `json:"position_y"`
	Width      int    `json:"width"`
	Height     int    `json:"height"`
	Settings   string `json:"settings"`
	IsVisible  bool   `json:"is_visible"`
}

// GetDashboardWidgets obtiene widgets del dashboard
func (r *SupportAgentRepository) GetDashboardWidgets(ctx context.Context, agentID int64) ([]*DashboardWidget, error) {
	query := `
		SELECT id, agent_id, widget_type, COALESCE(title, '') as title, position_x, position_y,
			width, height, COALESCE(settings, '{}')::text as settings, is_visible
		FROM dashboard_widgets
		WHERE agent_id = $1
		ORDER BY position_y, position_x
	`
	rows, err := r.pool.Query(ctx, query, agentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var widgets []*DashboardWidget
	for rows.Next() {
		w := &DashboardWidget{}
		if err := rows.Scan(&w.ID, &w.AgentID, &w.WidgetType, &w.Title, &w.PositionX, &w.PositionY,
			&w.Width, &w.Height, &w.Settings, &w.IsVisible); err != nil {
			return nil, err
		}
		widgets = append(widgets, w)
	}
	return widgets, nil
}

// SaveDashboardWidget guarda un widget
func (r *SupportAgentRepository) SaveDashboardWidget(ctx context.Context, agentID int64, widgetType, title string, posX, posY, width, height int, settings string) (*DashboardWidget, error) {
	query := `
		INSERT INTO dashboard_widgets (agent_id, widget_type, title, position_x, position_y, width, height, settings)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id
	`
	w := &DashboardWidget{AgentID: agentID, WidgetType: widgetType, Title: title, PositionX: posX, PositionY: posY, Width: width, Height: height, Settings: settings, IsVisible: true}
	err := r.pool.QueryRow(ctx, query, agentID, widgetType, title, posX, posY, width, height, settings).Scan(&w.ID)
	return w, err
}

// UpdateDashboardWidget actualiza un widget
func (r *SupportAgentRepository) UpdateDashboardWidget(ctx context.Context, widgetID, agentID int64, posX, posY, width, height *int, isVisible *bool) error {
	query := "UPDATE dashboard_widgets SET updated_at = NOW()"
	args := []interface{}{}
	argNum := 1

	if posX != nil {
		query += fmt.Sprintf(", position_x = $%d", argNum)
		args = append(args, *posX)
		argNum++
	}
	if posY != nil {
		query += fmt.Sprintf(", position_y = $%d", argNum)
		args = append(args, *posY)
		argNum++
	}
	if width != nil {
		query += fmt.Sprintf(", width = $%d", argNum)
		args = append(args, *width)
		argNum++
	}
	if height != nil {
		query += fmt.Sprintf(", height = $%d", argNum)
		args = append(args, *height)
		argNum++
	}
	if isVisible != nil {
		query += fmt.Sprintf(", is_visible = $%d", argNum)
		args = append(args, *isVisible)
		argNum++
	}

	query += fmt.Sprintf(" WHERE id = $%d AND agent_id = $%d", argNum, argNum+1)
	args = append(args, widgetID, agentID)

	_, err := r.pool.Exec(ctx, query, args...)
	return err
}

// DeleteDashboardWidget elimina un widget
func (r *SupportAgentRepository) DeleteDashboardWidget(ctx context.Context, widgetID, agentID int64) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM dashboard_widgets WHERE id = $1 AND agent_id = $2", widgetID, agentID)
	return err
}

// ========== TYPING INDICATORS ==========

// SetTypingIndicator establece indicador de escritura
func (r *SupportAgentRepository) SetTypingIndicator(ctx context.Context, chatID int64, chatType string, userID int64, isTyping bool) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO typing_indicators (chat_id, chat_type, user_id, is_typing, updated_at)
		VALUES ($1, $2, $3, $4, NOW())
		ON CONFLICT (chat_id, chat_type, user_id) DO UPDATE SET is_typing = $4, updated_at = NOW()
	`, chatID, chatType, userID, isTyping)
	return err
}

// GetTypingIndicators obtiene indicadores de escritura
func (r *SupportAgentRepository) GetTypingIndicators(ctx context.Context, chatID int64, chatType string) ([]int64, error) {
	query := `
		SELECT user_id FROM typing_indicators
		WHERE chat_id = $1 AND chat_type = $2 AND is_typing = true AND updated_at > NOW() - INTERVAL '5 seconds'
	`
	rows, err := r.pool.Query(ctx, query, chatID, chatType)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var userIDs []int64
	for rows.Next() {
		var uid int64
		if err := rows.Scan(&uid); err != nil {
			return nil, err
		}
		userIDs = append(userIDs, uid)
	}
	return userIDs, nil
}
