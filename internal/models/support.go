package models

import "time"

type SupportTicket struct {
	ID          int64      `json:"id"`
	UserID      int64      `json:"user_id"`
	Subject     string     `json:"subject"`
	Description string     `json:"description"`
	Category    string     `json:"category"`
	Priority    string     `json:"priority"`
	Status      string     `json:"status"`
	AssignedTo  *int64     `json:"assigned_to,omitempty"`
	ResolvedAt  *time.Time `json:"resolved_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type TicketMessage struct {
	ID        int64     `json:"id"`
	TicketID  int64     `json:"ticket_id"`
	UserID    int64     `json:"user_id"`
	Message   string    `json:"message"`
	IsAgent   bool      `json:"is_agent"`
	CreatedAt time.Time `json:"created_at"`
}

type CreateTicketRequest struct {
	Subject     string `json:"subject" binding:"required"`
	Description string `json:"description" binding:"required"`
	Category    string `json:"category" binding:"required"`
	Priority    string `json:"priority"`
}

type AddMessageRequest struct {
	Message string `json:"message" binding:"required"`
}

type TicketStats struct {
	TotalTickets  int `json:"total_tickets"`
	OpenTickets   int `json:"open_tickets"`
	ClosedTickets int `json:"closed_tickets"`
	AvgResponse   int `json:"avg_response_minutes"`
}
