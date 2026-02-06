package handlers

import (
	"net/http"
	"strconv"
	"tormentus/internal/models"
	"tormentus/internal/repositories"

	"github.com/gin-gonic/gin"
)

type SupportHandler struct {
	supportRepo *repositories.PostgresSupportRepository
}

func NewSupportHandler(supportRepo *repositories.PostgresSupportRepository) *SupportHandler {
	return &SupportHandler{supportRepo: supportRepo}
}

func (h *SupportHandler) CreateTicket(c *gin.Context) {
	userID := c.GetInt64("user_id")

	var req models.CreateTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	ticket, err := h.supportRepo.CreateTicket(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando ticket"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"ticket": ticket, "message": "Ticket creado exitosamente"})
}

func (h *SupportHandler) GetTickets(c *gin.Context) {
	userID := c.GetInt64("user_id")
	status := c.DefaultQuery("status", "all")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	tickets, err := h.supportRepo.GetUserTickets(userID, status, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo tickets"})
		return
	}

	if tickets == nil {
		tickets = []models.SupportTicket{}
	}

	c.JSON(http.StatusOK, gin.H{"tickets": tickets})
}

func (h *SupportHandler) GetTicket(c *gin.Context) {
	userID := c.GetInt64("user_id")
	ticketID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	ticket, err := h.supportRepo.GetTicket(ticketID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket no encontrado"})
		return
	}

	messages, _ := h.supportRepo.GetTicketMessages(ticketID, userID)
	if messages == nil {
		messages = []models.TicketMessage{}
	}

	c.JSON(http.StatusOK, gin.H{"ticket": ticket, "messages": messages})
}

func (h *SupportHandler) CloseTicket(c *gin.Context) {
	userID := c.GetInt64("user_id")
	ticketID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.supportRepo.UpdateTicketStatus(ticketID, userID, "closed"); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error cerrando ticket"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ticket cerrado"})
}

func (h *SupportHandler) AddMessage(c *gin.Context) {
	userID := c.GetInt64("user_id")
	ticketID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req models.AddMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Mensaje requerido"})
		return
	}

	msg, err := h.supportRepo.AddMessage(ticketID, userID, req.Message, false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error enviando mensaje"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": msg})
}

func (h *SupportHandler) GetStats(c *gin.Context) {
	userID := c.GetInt64("user_id")

	stats, err := h.supportRepo.GetUserStats(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estadísticas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"stats": stats})
}
