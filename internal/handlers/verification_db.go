package handlers

import (
	"net/http"
	"tormentus/internal/models"
	"tormentus/internal/repositories"

	"github.com/gin-gonic/gin"
)

// VerificationDBHandler maneja la verificación con persistencia en DB
type VerificationDBHandler struct {
	verificationRepo *repositories.PostgresVerificationRepository
}

// NewVerificationDBHandler crea un nuevo handler de verificación con DB
func NewVerificationDBHandler(verificationRepo *repositories.PostgresVerificationRepository) *VerificationDBHandler {
	return &VerificationDBHandler{verificationRepo: verificationRepo}
}

// SubmitVerification envía documentos para verificación
func (h *VerificationDBHandler) SubmitVerification(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(int64)

	var req struct {
		DocumentType  string `json:"document_type" binding:"required"`
		DocumentFront string `json:"document_front" binding:"required"`
		DocumentBack  string `json:"document_back"`
		SelfieWithDoc string `json:"selfie_with_doc" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verificar si ya tiene una solicitud pendiente
	existing, _ := h.verificationRepo.GetVerificationByUserID(userID)
	if existing != nil && existing.Status == models.VerificationPending {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ya tienes una solicitud de verificación pendiente"})
		return
	}

	verification := &models.UserVerification{
		UserID:        userID,
		DocumentType:  req.DocumentType,
		DocumentFront: req.DocumentFront,
		DocumentBack:  req.DocumentBack,
		SelfieWithDoc: req.SelfieWithDoc,
		Status:        models.VerificationPending,
	}

	if err := h.verificationRepo.CreateVerification(verification); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error guardando verificación"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "Documentos enviados para verificación",
		"verification": verification,
	})
}

// GetVerificationStatus obtiene el estado de verificación
func (h *VerificationDBHandler) GetVerificationStatus(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(int64)

	verification, err := h.verificationRepo.GetVerificationByUserID(userID)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  "not_submitted",
			"message": "No has enviado documentos de verificación",
		})
		return
	}

	kycStatus, _ := h.verificationRepo.GetKYCStatus(userID)

	c.JSON(http.StatusOK, gin.H{
		"status":       verification.Status,
		"verification": verification,
		"kyc_status":   kycStatus,
	})
}

// CheckVerificationRequired verifica si el usuario necesita verificarse
func (h *VerificationDBHandler) CheckVerificationRequired(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(int64)

	verification, err := h.verificationRepo.GetVerificationByUserID(userID)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"verification_required": true,
			"can_trade":             false,
			"message":               "Debes verificar tu cuenta para poder operar",
		})
		return
	}

	switch verification.Status {
	case models.VerificationPending:
		c.JSON(http.StatusOK, gin.H{
			"verification_required": false,
			"can_trade":             false,
			"message":               "Tu verificación está en proceso de revisión",
		})
	case models.VerificationApproved:
		c.JSON(http.StatusOK, gin.H{
			"verification_required": false,
			"can_trade":             true,
			"message":               "Tu cuenta está verificada",
		})
	case models.VerificationRejected:
		c.JSON(http.StatusOK, gin.H{
			"verification_required": true,
			"can_trade":             false,
			"message":               "Tu verificación fue rechazada: " + verification.RejectionReason,
		})
	}
}

// AdminApproveVerification aprueba una verificación (solo admin)
func (h *VerificationDBHandler) AdminApproveVerification(c *gin.Context) {
	var req struct {
		UserID int64 `json:"user_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.verificationRepo.UpdateVerificationStatus(req.UserID, models.VerificationApproved, ""); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error aprobando verificación"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Verificación aprobada"})
}

// AdminRejectVerification rechaza una verificación (solo admin)
func (h *VerificationDBHandler) AdminRejectVerification(c *gin.Context) {
	var req struct {
		UserID int64  `json:"user_id" binding:"required"`
		Reason string `json:"reason" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.verificationRepo.UpdateVerificationStatus(req.UserID, models.VerificationRejected, req.Reason); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error rechazando verificación"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Verificación rechazada"})
}

// GetPendingVerifications obtiene verificaciones pendientes (solo admin)
func (h *VerificationDBHandler) GetPendingVerifications(c *gin.Context) {
	verifications, err := h.verificationRepo.GetPendingVerifications()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo verificaciones"})
		return
	}

	if verifications == nil {
		verifications = []*models.UserVerification{}
	}

	c.JSON(http.StatusOK, gin.H{"verifications": verifications})
}

// GetLoginHistory obtiene el historial de logins del usuario
func (h *VerificationDBHandler) GetLoginHistory(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(int64)

	history, err := h.verificationRepo.GetLoginHistory(userID, 20)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo historial"})
		return
	}

	if history == nil {
		history = []*models.LoginHistory{}
	}

	c.JSON(http.StatusOK, gin.H{"history": history})
}

// GetActiveSessions obtiene las sesiones activas del usuario
func (h *VerificationDBHandler) GetActiveSessions(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(int64)

	sessions, err := h.verificationRepo.GetActiveSessions(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo sesiones"})
		return
	}

	if sessions == nil {
		sessions = []*models.UserSession{}
	}

	c.JSON(http.StatusOK, gin.H{"sessions": sessions})
}

// InvalidateSession cierra una sesión específica
func (h *VerificationDBHandler) InvalidateSession(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(int64)

	var req struct {
		SessionID int64 `json:"session_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de sesión requerido"})
		return
	}

	if err := h.verificationRepo.InvalidateSession(req.SessionID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error cerrando sesión"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Sesión cerrada"})
}

// InvalidateAllSessions cierra todas las sesiones del usuario
func (h *VerificationDBHandler) InvalidateAllSessions(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(int64)

	if err := h.verificationRepo.InvalidateAllSessions(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error cerrando sesiones"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Todas las sesiones cerradas"})
}

// GetSecurityEvents obtiene los eventos de seguridad del usuario
func (h *VerificationDBHandler) GetSecurityEvents(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(int64)

	events, err := h.verificationRepo.GetSecurityEvents(userID, 20)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo eventos"})
		return
	}

	if events == nil {
		events = []*models.SecurityEvent{}
	}

	c.JSON(http.StatusOK, gin.H{"events": events})
}
