package handlers

import (
	"net/http"
	"strconv"
	"tormentus/internal/repositories"

	"github.com/gin-gonic/gin"
)

type ReferralHandler struct {
	referralRepo repositories.ReferralRepository
}

func NewReferralHandler(referralRepo repositories.ReferralRepository) *ReferralHandler {
	return &ReferralHandler{referralRepo: referralRepo}
}

func (h *ReferralHandler) GetStats(c *gin.Context) {
	userID := c.GetInt64("user_id")

	stats, err := h.referralRepo.GetReferralStats(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estadísticas"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"stats": stats})
}

func (h *ReferralHandler) GetReferrals(c *gin.Context) {
	userID := c.GetInt64("user_id")

	referrals, err := h.referralRepo.GetReferrals(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo referidos"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"referrals": referrals})
}

func (h *ReferralHandler) GetCommissions(c *gin.Context) {
	userID := c.GetInt64("user_id")
	status := c.DefaultQuery("status", "all")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	commissions, err := h.referralRepo.GetCommissions(userID, status, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo comisiones"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"commissions": commissions})
}

func (h *ReferralHandler) GetTiers(c *gin.Context) {
	tiers, err := h.referralRepo.GetTiers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo niveles"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"tiers": tiers})
}

func (h *ReferralHandler) GetReferralCode(c *gin.Context) {
	userID := c.GetInt64("user_id")

	code, err := h.referralRepo.GetReferralCode(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo código"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": code, "link": "https://tormentus.com/ref/" + code})
}
