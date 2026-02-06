package handlers

import (
	"net/http"
	"strconv"
	"tormentus/internal/models"
	"tormentus/internal/repositories"

	"github.com/gin-gonic/gin"
)

type NotificationHandler struct {
	notifRepo repositories.NotificationRepository
}

func NewNotificationHandler(notifRepo repositories.NotificationRepository) *NotificationHandler {
	return &NotificationHandler{notifRepo: notifRepo}
}

func (h *NotificationHandler) GetNotifications(c *gin.Context) {
	userID := c.GetInt64("user_id")
	notifType := c.DefaultQuery("type", "all")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	notifications, err := h.notifRepo.GetNotifications(userID, notifType, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo notificaciones"})
		return
	}

	unreadCount, _ := h.notifRepo.GetUnreadCount(userID)
	c.JSON(http.StatusOK, gin.H{"notifications": notifications, "unread_count": unreadCount})
}

func (h *NotificationHandler) GetUnreadCount(c *gin.Context) {
	userID := c.GetInt64("user_id")
	count, err := h.notifRepo.GetUnreadCount(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo conteo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"count": count})
}

func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	userID := c.GetInt64("user_id")
	notifID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.notifRepo.MarkAsRead(userID, notifID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error marcando como leída"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Marcada como leída"})
}

func (h *NotificationHandler) MarkAllAsRead(c *gin.Context) {
	userID := c.GetInt64("user_id")
	if err := h.notifRepo.MarkAllAsRead(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error marcando todas como leídas"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Todas marcadas como leídas"})
}

func (h *NotificationHandler) DeleteNotification(c *gin.Context) {
	userID := c.GetInt64("user_id")
	notifID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.notifRepo.DeleteNotification(userID, notifID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando notificación"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Notificación eliminada"})
}

func (h *NotificationHandler) DeleteAllNotifications(c *gin.Context) {
	userID := c.GetInt64("user_id")
	if err := h.notifRepo.DeleteAllNotifications(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando notificaciones"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Todas las notificaciones eliminadas"})
}

func (h *NotificationHandler) GetSettings(c *gin.Context) {
	userID := c.GetInt64("user_id")
	settings, err := h.notifRepo.GetSettings(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo configuración"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"settings": settings})
}

func (h *NotificationHandler) UpdateSettings(c *gin.Context) {
	userID := c.GetInt64("user_id")
	var settings models.NotificationSettings
	if err := c.ShouldBindJSON(&settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if err := h.notifRepo.UpdateSettings(userID, &settings); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando configuración"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Configuración actualizada"})
}

func (h *NotificationHandler) GetPriceAlerts(c *gin.Context) {
	userID := c.GetInt64("user_id")
	alerts, err := h.notifRepo.GetPriceAlerts(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo alertas"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"alerts": alerts})
}

func (h *NotificationHandler) CreatePriceAlert(c *gin.Context) {
	userID := c.GetInt64("user_id")
	var alert models.PriceAlert
	if err := c.ShouldBindJSON(&alert); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}
	alert.UserID = userID

	if err := h.notifRepo.CreatePriceAlert(&alert); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando alerta"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Alerta creada", "alert": alert})
}

func (h *NotificationHandler) TogglePriceAlert(c *gin.Context) {
	userID := c.GetInt64("user_id")
	alertID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.notifRepo.TogglePriceAlert(userID, alertID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando alerta"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Alerta actualizada"})
}

func (h *NotificationHandler) DeletePriceAlert(c *gin.Context) {
	userID := c.GetInt64("user_id")
	alertID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.notifRepo.DeletePriceAlert(userID, alertID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando alerta"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Alerta eliminada"})
}
