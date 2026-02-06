package handlers

import (
	"net/http"
	"strconv"
	"tormentus/internal/models"
	"tormentus/internal/repositories"

	"github.com/gin-gonic/gin"
)

type TournamentDBHandler struct {
	tournamentRepo *repositories.PostgresTournamentRepository
}

func NewTournamentDBHandler(tournamentRepo *repositories.PostgresTournamentRepository) *TournamentDBHandler {
	return &TournamentDBHandler{tournamentRepo: tournamentRepo}
}

func (h *TournamentDBHandler) GetTournaments(c *gin.Context) {
	status := c.DefaultQuery("status", "all")

	tournaments, err := h.tournamentRepo.GetAll(status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo torneos"})
		return
	}

	if tournaments == nil {
		tournaments = []models.Tournament{}
	}

	c.JSON(http.StatusOK, gin.H{"tournaments": tournaments})
}

func (h *TournamentDBHandler) GetTournament(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	tournament, err := h.tournamentRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Torneo no encontrado"})
		return
	}

	leaderboard, _ := h.tournamentRepo.GetLeaderboard(id, 10)
	if leaderboard == nil {
		leaderboard = []models.TournamentParticipant{}
	}

	c.JSON(http.StatusOK, gin.H{
		"tournament":  tournament,
		"leaderboard": leaderboard,
	})
}

func (h *TournamentDBHandler) JoinTournament(c *gin.Context) {
	userID := c.GetInt64("user_id")
	tournamentID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	// Verify tournament exists and is joinable
	tournament, err := h.tournamentRepo.GetByID(tournamentID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Torneo no encontrado"})
		return
	}

	if tournament.Status == models.TournamentFinished {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El torneo ya terminó"})
		return
	}

	if tournament.Participants >= tournament.MaxParticipants {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Torneo lleno"})
		return
	}

	participant, err := h.tournamentRepo.Join(tournamentID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error uniéndose al torneo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Inscrito exitosamente",
		"participant": participant,
		"entry_fee":   tournament.EntryFee,
	})
}

func (h *TournamentDBHandler) GetLeaderboard(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	leaderboard, err := h.tournamentRepo.GetLeaderboard(id, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo leaderboard"})
		return
	}

	if leaderboard == nil {
		leaderboard = []models.TournamentParticipant{}
	}

	c.JSON(http.StatusOK, gin.H{"leaderboard": leaderboard})
}

func (h *TournamentDBHandler) GetMyTournaments(c *gin.Context) {
	userID := c.GetInt64("user_id")

	tournaments, err := h.tournamentRepo.GetUserTournaments(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo torneos"})
		return
	}

	if tournaments == nil {
		tournaments = []models.Tournament{}
	}

	// Get participant info for each tournament
	result := make([]gin.H, 0)
	for _, t := range tournaments {
		participant, _ := h.tournamentRepo.GetParticipant(t.ID, userID)
		result = append(result, gin.H{
			"tournament":  t,
			"participant": participant,
		})
	}

	c.JSON(http.StatusOK, gin.H{"tournaments": result})
}

func (h *TournamentDBHandler) GetMyParticipation(c *gin.Context) {
	userID := c.GetInt64("user_id")
	tournamentID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	participant, err := h.tournamentRepo.GetParticipant(tournamentID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No estás inscrito en este torneo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"participant": participant})
}

func (h *TournamentDBHandler) Rebuy(c *gin.Context) {
	userID := c.GetInt64("user_id")
	tournamentID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	tournament, err := h.tournamentRepo.GetByID(tournamentID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Torneo no encontrado"})
		return
	}

	if tournament.Status != models.TournamentActive {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El torneo no está activo"})
		return
	}

	if err := h.tournamentRepo.Rebuy(tournamentID, userID, tournament.InitialBalance); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error en rebuy"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Rebuy exitoso",
		"balance": tournament.InitialBalance,
	})
}

func (h *TournamentDBHandler) GetPrizeDistribution(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"distribution": models.DefaultPrizeDistribution,
		"platform_fee": 20,
	})
}
