package handlers

import (
	"net/http"

	"tormentus/internal/models"
	"tormentus/internal/repositories"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type ProfileHandler struct {
	userRepo repositories.UserRepository
}

func NewProfileHandler(userRepo repositories.UserRepository) *ProfileHandler {
	return &ProfileHandler{userRepo: userRepo}
}

// UpdateProfileRequest estructura para actualizar perfil
type UpdateProfileRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Phone     string `json:"phone"`
	Country   string `json:"country"`
}

// UpdateProfile actualiza el perfil del usuario
func (h *ProfileHandler) UpdateProfile(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := c.Request.Context()

	user, err := h.userRepo.GetUserByID(ctx, userID.(int64))
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}

	// Actualizar campos
	if req.FirstName != "" {
		user.FirstName = req.FirstName
	}
	if req.LastName != "" {
		user.LastName = req.LastName
	}

	if err := h.userRepo.UpdateUser(ctx, user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando perfil"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Perfil actualizado",
		"user": gin.H{
			"id":         user.ID,
			"email":      user.Email,
			"first_name": user.FirstName,
			"last_name":  user.LastName,
		},
	})
}

// ChangePasswordRequest estructura para cambiar contraseña
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=6"`
}

// ChangePassword cambia la contraseña del usuario
func (h *ProfileHandler) ChangePassword(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := c.Request.Context()

	user, err := h.userRepo.GetUserByID(ctx, userID.(int64))
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}

	// Verificar contraseña actual
	if !user.CheckPassword(req.CurrentPassword) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Contraseña actual incorrecta"})
		return
	}

	// Hash nueva contraseña
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error procesando contraseña"})
		return
	}

	if err := h.userRepo.UpdatePassword(ctx, userID.(int64), string(hashedPassword)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando contraseña"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Contraseña actualizada exitosamente"})
}

// GetUserStats obtiene estadísticas del usuario
func (h *ProfileHandler) GetUserStats(c *gin.Context) {
	userID, _ := c.Get("userID")

	ctx := c.Request.Context()

	user, err := h.userRepo.GetUserByID(ctx, userID.(int64))
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}

	stats, err := h.userRepo.GetUserStats(ctx, userID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estadísticas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"stats": stats})
}

// GetUserSettings obtiene la configuración del usuario
func (h *ProfileHandler) GetUserSettings(c *gin.Context) {
	userID, _ := c.Get("userID")

	ctx := c.Request.Context()

	settings, err := h.userRepo.GetUserSettings(ctx, userID.(int64))
	if err != nil {
		// Si no hay settings, devolver defaults
		settings = &models.UserSettings{
			UserID:          userID.(int64),
			Theme:           "dark",
			Language:        "es",
			Timezone:        "America/Mexico_City",
			Currency:        "USD",
			SoundEffects:    true,
			ShowBalance:     true,
			ConfirmTrades:   true,
			DefaultAmount:   10,
			DefaultDuration: 60,
		}
	}

	c.JSON(http.StatusOK, gin.H{"settings": settings})
}

// UpdateUserSettings actualiza la configuración del usuario
func (h *ProfileHandler) UpdateUserSettings(c *gin.Context) {
	userID, _ := c.Get("userID")

	var settings models.UserSettings
	if err := c.ShouldBindJSON(&settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	settings.UserID = userID.(int64)

	ctx := c.Request.Context()

	if err := h.userRepo.SaveUserSettings(ctx, &settings); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error guardando configuración"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Configuración guardada",
		"settings": settings,
	})
}
