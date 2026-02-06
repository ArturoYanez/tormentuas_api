package repositories

import (
	"database/sql"
	"time"
	"tormentus/internal/models"
)

type PostgresSupportRepository struct {
	db *sql.DB
}

func NewPostgresSupportRepository(db *sql.DB) *PostgresSupportRepository {
	return &PostgresSupportRepository{db: db}
}

func (r *PostgresSupportRepository) CreateTicket(userID int64, req *models.CreateTicketRequest) (*models.SupportTicket, error) {
	priority := req.Priority
	if priority == "" {
		priority = "medium"
	}

	ticket := &models.SupportTicket{
		UserID:      userID,
		Subject:     req.Subject,
		Description: req.Description,
		Category:    req.Category,
		Priority:    priority,
		Status:      "open",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	err := r.db.QueryRow(`
		INSERT INTO support_tickets (user_id, subject, description, category, priority, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id
	`, userID, req.Subject, req.Description, req.Category, priority, "open", ticket.CreatedAt, ticket.UpdatedAt).Scan(&ticket.ID)

	if err != nil {
		return nil, err
	}
	return ticket, nil
}

func (r *PostgresSupportRepository) GetUserTickets(userID int64, status string, limit, offset int) ([]models.SupportTicket, error) {
	query := `SELECT id, user_id, subject, description, category, priority, status, assigned_to, resolved_at, created_at, updated_at
		FROM support_tickets WHERE user_id = $1`
	args := []interface{}{userID}

	if status != "" && status != "all" {
		query += " AND status = $2"
		args = append(args, status)
	}

	query += " ORDER BY created_at DESC LIMIT $" + string(rune('0'+len(args)+1)) + " OFFSET $" + string(rune('0'+len(args)+2))
	args = append(args, limit, offset)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tickets []models.SupportTicket
	for rows.Next() {
		var t models.SupportTicket
		err := rows.Scan(&t.ID, &t.UserID, &t.Subject, &t.Description, &t.Category, &t.Priority, &t.Status, &t.AssignedTo, &t.ResolvedAt, &t.CreatedAt, &t.UpdatedAt)
		if err != nil {
			continue
		}
		tickets = append(tickets, t)
	}
	return tickets, nil
}

func (r *PostgresSupportRepository) GetTicket(ticketID, userID int64) (*models.SupportTicket, error) {
	var t models.SupportTicket
	err := r.db.QueryRow(`
		SELECT id, user_id, subject, description, category, priority, status, assigned_to, resolved_at, created_at, updated_at
		FROM support_tickets WHERE id = $1 AND user_id = $2
	`, ticketID, userID).Scan(&t.ID, &t.UserID, &t.Subject, &t.Description, &t.Category, &t.Priority, &t.Status, &t.AssignedTo, &t.ResolvedAt, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *PostgresSupportRepository) UpdateTicketStatus(ticketID, userID int64, status string) error {
	var resolvedAt interface{}
	if status == "closed" || status == "resolved" {
		now := time.Now()
		resolvedAt = now
	}

	_, err := r.db.Exec(`
		UPDATE support_tickets SET status = $1, resolved_at = $2, updated_at = $3
		WHERE id = $4 AND user_id = $5
	`, status, resolvedAt, time.Now(), ticketID, userID)
	return err
}

func (r *PostgresSupportRepository) AddMessage(ticketID, userID int64, message string, isAgent bool) (*models.TicketMessage, error) {
	msg := &models.TicketMessage{
		TicketID:  ticketID,
		UserID:    userID,
		Message:   message,
		IsAgent:   isAgent,
		CreatedAt: time.Now(),
	}

	err := r.db.QueryRow(`
		INSERT INTO ticket_messages (ticket_id, user_id, message, is_agent, created_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`, ticketID, userID, message, isAgent, msg.CreatedAt).Scan(&msg.ID)

	if err != nil {
		return nil, err
	}
	return msg, nil
}

func (r *PostgresSupportRepository) GetTicketMessages(ticketID, userID int64) ([]models.TicketMessage, error) {
	// Verify user owns ticket
	var count int
	r.db.QueryRow("SELECT COUNT(*) FROM support_tickets WHERE id = $1 AND user_id = $2", ticketID, userID).Scan(&count)
	if count == 0 {
		return nil, sql.ErrNoRows
	}

	rows, err := r.db.Query(`
		SELECT id, ticket_id, user_id, message, is_agent, created_at
		FROM ticket_messages WHERE ticket_id = $1 ORDER BY created_at ASC
	`, ticketID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []models.TicketMessage
	for rows.Next() {
		var m models.TicketMessage
		if err := rows.Scan(&m.ID, &m.TicketID, &m.UserID, &m.Message, &m.IsAgent, &m.CreatedAt); err != nil {
			continue
		}
		messages = append(messages, m)
	}
	return messages, nil
}

func (r *PostgresSupportRepository) GetUserStats(userID int64) (*models.TicketStats, error) {
	stats := &models.TicketStats{}

	r.db.QueryRow("SELECT COUNT(*) FROM support_tickets WHERE user_id = $1", userID).Scan(&stats.TotalTickets)
	r.db.QueryRow("SELECT COUNT(*) FROM support_tickets WHERE user_id = $1 AND status = 'open'", userID).Scan(&stats.OpenTickets)
	r.db.QueryRow("SELECT COUNT(*) FROM support_tickets WHERE user_id = $1 AND status IN ('closed', 'resolved')", userID).Scan(&stats.ClosedTickets)
	stats.AvgResponse = 15 // Mock average response time

	return stats, nil
}
