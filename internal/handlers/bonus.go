package handlers

import (
	"net/http"
	"strconv"
	"tormentus/internal/repositories"

	"github.com/gin-gonic/gin"
)

type BonusHandler struct {
	bonusRepo repositories.BonusRepository
}

func NewBonusHandler(bonusRepo repositories.BonusRepository) *BonusHandler {
	return &BonusHandler{bonusRepo: bonusRepo}
}

// GetAvailableBonuses returns all available bonuses
func (h *BonusHandler) GetAvailableBonuses(c *gin.Context) {
	bonuses, err := h.bonusRepo.GetAvailableBonuses()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo bonos"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"bonuses": bonuses})
}

// GetUserBonuses returns user's bonuses
func (h *BonusHandler) GetUserBonuses(c *gin.Context) {
	userID := c.GetInt64("user_id")
	status := c.DefaultQuery("status", "all")

	bonuses, err := h.bonusRepo.GetUserBonuses(userID, status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo bonos del usuario"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"bonuses": bonuses})
}

// GetActiveBonus returns user's active bonus
func (h *BonusHandler) GetActiveBonus(c *gin.Context) {
	userID := c.GetInt64("user_id")

	bonus, err := h.bonusRepo.GetActiveUserBonus(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo bono activo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"bonus": bonus})
}

// GetBonusStats returns user's bonus statistics
func (h *BonusHandler) GetBonusStats(c *gin.Context) {
	userID := c.GetInt64("user_id")

	stats, err := h.bonusRepo.GetUserBonusStats(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estadísticas"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"stats": stats})
}

// ClaimBonus claims a bonus for the user
func (h *BonusHandler) ClaimBonus(c *gin.Context) {
	userID := c.GetInt64("user_id")
	bonusIDStr := c.Param("id")
	bonusID, err := strconv.ParseInt(bonusIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de bono inválido"})
		return
	}

	bonus, err := h.bonusRepo.GetBonusByID(bonusID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bono no encontrado"})
		return
	}

	rolloverRequired := bonus.Amount * float64(bonus.RolloverMultiplier)
	err = h.bonusRepo.ClaimBonus(userID, bonusID, bonus.Amount, rolloverRequired)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bono reclamado exitosamente"})
}

// ApplyPromoCode applies a promo code
func (h *BonusHandler) ApplyPromoCode(c *gin.Context) {
	userID := c.GetInt64("user_id")

	var req struct {
		Code string `json:"code" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Código requerido"})
		return
	}

	bonus, err := h.bonusRepo.ApplyPromoCode(userID, req.Code)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Código aplicado exitosamente", "bonus": bonus})
}

// CancelBonus cancels an active bonus
func (h *BonusHandler) CancelBonus(c *gin.Context) {
	userID := c.GetInt64("user_id")
	bonusIDStr := c.Param("id")
	bonusID, err := strconv.ParseInt(bonusIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de bono inválido"})
		return
	}

	err = h.bonusRepo.CancelUserBonus(userID, bonusID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bono cancelado"})
}
