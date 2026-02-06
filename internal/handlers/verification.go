package handlers

import (
	"net/http"

	"tormentus/internal/models"

	"github.com/gin-gonic/gin"
)

// VerificationHandler maneja la verificación de usuarios
type VerificationHandler struct {
	// En producción, usar repositorio de base de datos
	verifications map[int64]*models.UserVerification
}

// NewVerificationHandler crea un nuevo handler de verificación
func NewVerificationHandler() *VerificationHandler {
	return &VerificationHandler{
		verifications: make(map[int64]*models.UserVerification),
	}
}

// SubmitVerificationRequest request para enviar verificación
type SubmitVerificationRequest struct {
	DocumentType  string `json:"document_type" binding:"required"`
	DocumentFront string `json:"document_front" binding:"required"`
	DocumentBack  string `json:"document_back"`
	SelfieWithDoc string `json:"selfie_with_doc" binding:"required"`
}

// SubmitVerification envía documentos para verificación
func (h *VerificationHandler) SubmitVerification(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	var req SubmitVerificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verificar si ya tiene una solicitud pendiente
	if existing, exists := h.verifications[userID.(int64)]; exists {
		if existing.Status == models.VerificationPending {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Ya tienes una solicitud de verificación pendiente",
			})
			return
		}
	}

	verification := &models.UserVerification{
		ID:            userID.(int64),
		UserID:        userID.(int64),
		DocumentType:  req.DocumentType,
		DocumentFront: req.DocumentFront,
		DocumentBack:  req.DocumentBack,
		SelfieWithDoc: req.SelfieWithDoc,
		Status:        models.VerificationPending,
	}

	h.verifications[userID.(int64)] = verification

	c.JSON(http.StatusOK, gin.H{
		"message":      "Documentos enviados para verificación",
		"verification": verification,
	})
}

// GetVerificationStatus obtiene el estado de verificación
func (h *VerificationHandler) GetVerificationStatus(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	verification, exists := h.verifications[userID.(int64)]
	if !exists {
		c.JSON(http.StatusOK, gin.H{
			"status":  "not_submitted",
			"message": "No has enviado documentos de verificación",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":       verification.Status,
		"verification": verification,
	})
}

// CheckVerificationRequired verifica si el usuario necesita verificarse
func (h *VerificationHandler) CheckVerificationRequired(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	verification, exists := h.verifications[userID.(int64)]
	
	if !exists {
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
func (h *VerificationHandler) AdminApproveVerification(c *gin.Context) {
	// En producción, verificar que el usuario sea admin
	
	var req struct {
		UserID int64 `json:"user_id" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	verification, exists := h.verifications[req.UserID]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Verificación no encontrada"})
		return
	}

	verification.Status = models.VerificationApproved

	c.JSON(http.StatusOK, gin.H{
		"message":      "Verificación aprobada",
		"verification": verification,
	})
}

// AdminRejectVerification rechaza una verificación (solo admin)
func (h *VerificationHandler) AdminRejectVerification(c *gin.Context) {
	var req struct {
		UserID int64  `json:"user_id" binding:"required"`
		Reason string `json:"reason" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	verification, exists := h.verifications[req.UserID]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Verificación no encontrada"})
		return
	}

	verification.Status = models.VerificationRejected
	verification.RejectionReason = req.Reason

	c.JSON(http.StatusOK, gin.H{
		"message":      "Verificación rechazada",
		"verification": verification,
	})
}

// GetPendingVerifications obtiene verificaciones pendientes (solo admin)
func (h *VerificationHandler) GetPendingVerifications(c *gin.Context) {
	pending := make([]*models.UserVerification, 0)
	
	for _, v := range h.verifications {
		if v.Status == models.VerificationPending {
			pending = append(pending, v)
		}
	}

	c.JSON(http.StatusOK, gin.H{"verifications": pending})
}
