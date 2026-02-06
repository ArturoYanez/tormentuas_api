package repositories

import "tormentus/internal/models"

type SupportRepository interface {
	CreateTicket(userID int64, req *models.CreateTicketRequest) (*models.SupportTicket, error)
	GetUserTickets(userID int64, status string, limit, offset int) ([]models.SupportTicket, error)
	GetTicket(ticketID, userID int64) (*models.SupportTicket, error)
	UpdateTicketStatus(ticketID, userID int64, status string) error
	AddMessage(ticketID, userID int64, message string, isAgent bool) (*models.TicketMessage, error)
	GetTicketMessages(ticketID, userID int64) ([]models.TicketMessage, error)
	GetUserStats(userID int64) (*models.TicketStats, error)
}
