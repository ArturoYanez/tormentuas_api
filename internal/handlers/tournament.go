package handlers

import (
	"net/http"
	"strconv"
	"sync"
	"time"

	"tormentus/internal/models"

	"github.com/gin-gonic/gin"
)

// TournamentHandler maneja los torneos
type TournamentHandler struct {
	tournaments  map[int64]*models.Tournament
	participants map[int64][]*models.TournamentParticipant
	mutex        sync.RWMutex
	counter      int64
}

// NewTournamentHandler crea un nuevo handler de torneos
func NewTournamentHandler() *TournamentHandler {
	h := &TournamentHandler{
		tournaments:  make(map[int64]*models.Tournament),
		participants: make(map[int64][]*models.TournamentParticipant),
		counter:      0,
	}
	
	// Crear torneos de ejemplo
	h.createSampleTournaments()
	
	return h
}

// createSampleTournaments crea torneos de ejemplo
func (h *TournamentHandler) createSampleTournaments() {
	now := time.Now()
	
	// Torneo gratuito
	h.counter++
	h.tournaments[h.counter] = &models.Tournament{
		ID:              h.counter,
		Title:           "Torneo Principiantes",
		Description:     "Torneo gratuito para nuevos traders",
		EntryFee:        0,
		InitialBalance:  200,
		PrizePool:       500,
		MaxParticipants: 100,
		Status:          models.TournamentActive,
		StartsAt:        now,
		EndsAt:          now.Add(24 * time.Hour),
		CreatedAt:       now,
	}

	// Torneos de pago
	h.counter++
	h.tournaments[h.counter] = &models.Tournament{
		ID:              h.counter,
		Title:           "Torneo Bronce",
		Description:     "Torneo para traders intermedios",
		EntryFee:        10,
		InitialBalance:  200,
		PrizePool:       0, // Se calcula con las entradas
		MaxParticipants: 50,
		Status:          models.TournamentUpcoming,
		StartsAt:        now.Add(2 * time.Hour),
		EndsAt:          now.Add(26 * time.Hour),
		CreatedAt:       now,
	}

	h.counter++
	h.tournaments[h.counter] = &models.Tournament{
		ID:              h.counter,
		Title:           "Torneo Plata",
		Description:     "Torneo para traders avanzados",
		EntryFee:        50,
		InitialBalance:  200,
		PrizePool:       0,
		MaxParticipants: 30,
		Status:          models.TournamentUpcoming,
		StartsAt:        now.Add(4 * time.Hour),
		EndsAt:          now.Add(28 * time.Hour),
		CreatedAt:       now,
	}

	h.counter++
	h.tournaments[h.counter] = &models.Tournament{
		ID:              h.counter,
		Title:           "Torneo Oro",
		Description:     "Torneo premium para profesionales",
		EntryFee:        100,
		InitialBalance:  200,
		PrizePool:       0,
		MaxParticipants: 20,
		Status:          models.TournamentUpcoming,
		StartsAt:        now.Add(6 * time.Hour),
		EndsAt:          now.Add(30 * time.Hour),
		CreatedAt:       now,
	}

	h.counter++
	h.tournaments[h.counter] = &models.Tournament{
		ID:              h.counter,
		Title:           "Torneo Diamante",
		Description:     "El torneo más exclusivo",
		EntryFee:        500,
		InitialBalance:  200,
		PrizePool:       0,
		MaxParticipants: 10,
		Status:          models.TournamentUpcoming,
		StartsAt:        now.Add(12 * time.Hour),
		EndsAt:          now.Add(36 * time.Hour),
		CreatedAt:       now,
	}
}

// GetTournaments obtiene todos los torneos
func (h *TournamentHandler) GetTournaments(c *gin.Context) {
	h.mutex.RLock()
	defer h.mutex.RUnlock()

	tournaments := make([]*models.Tournament, 0, len(h.tournaments))
	for _, t := range h.tournaments {
		// Calcular prize pool para torneos de pago
		if t.EntryFee > 0 {
			participants := h.participants[t.ID]
			t.PrizePool = float64(len(participants)) * t.EntryFee * 0.8 // 80% para premios
		}
		tournaments = append(tournaments, t)
	}

	c.JSON(http.StatusOK, gin.H{"tournaments": tournaments})
}

// GetTournament obtiene un torneo específico
func (h *TournamentHandler) GetTournament(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	h.mutex.RLock()
	tournament, exists := h.tournaments[id]
	participants := h.participants[id]
	h.mutex.RUnlock()

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Torneo no encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"tournament":   tournament,
		"participants": len(participants),
		"leaderboard":  h.getLeaderboard(id),
	})
}

// JoinTournament une a un usuario a un torneo
func (h *TournamentHandler) JoinTournament(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	idStr := c.Param("id")
	tournamentID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	h.mutex.Lock()
	defer h.mutex.Unlock()

	tournament, exists := h.tournaments[tournamentID]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Torneo no encontrado"})
		return
	}

	// Verificar si ya está inscrito
	for _, p := range h.participants[tournamentID] {
		if p.UserID == userID.(int64) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Ya estás inscrito en este torneo"})
			return
		}
	}

	// Verificar límite de participantes
	if len(h.participants[tournamentID]) >= tournament.MaxParticipants {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Torneo lleno"})
		return
	}

	// Crear participante
	participant := &models.TournamentParticipant{
		ID:           int64(len(h.participants[tournamentID]) + 1),
		TournamentID: tournamentID,
		UserID:       userID.(int64),
		Balance:      tournament.InitialBalance,
		Profit:       0,
		TradesCount:  0,
		WinsCount:    0,
		Rank:         len(h.participants[tournamentID]) + 1,
		JoinedAt:     time.Now(),
	}

	h.participants[tournamentID] = append(h.participants[tournamentID], participant)

	c.JSON(http.StatusOK, gin.H{
		"message":     "Inscrito exitosamente",
		"participant": participant,
		"entry_fee":   tournament.EntryFee,
	})
}

// GetLeaderboard obtiene el ranking del torneo
func (h *TournamentHandler) GetLeaderboard(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	leaderboard := h.getLeaderboard(id)
	c.JSON(http.StatusOK, gin.H{"leaderboard": leaderboard})
}

// getLeaderboard obtiene el ranking interno
func (h *TournamentHandler) getLeaderboard(tournamentID int64) []*models.TournamentParticipant {
	h.mutex.RLock()
	defer h.mutex.RUnlock()

	participants := h.participants[tournamentID]
	if len(participants) == 0 {
		return []*models.TournamentParticipant{}
	}

	// Ordenar por profit (mayor a menor)
	// En producción usar sort.Slice
	return participants
}

// GetPrizeDistribution obtiene la distribución de premios
func (h *TournamentHandler) GetPrizeDistribution(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"distribution": models.DefaultPrizeDistribution,
		"platform_fee": 20, // 20% para la plataforma
	})
}

// GetMyTournaments obtiene los torneos del usuario
func (h *TournamentHandler) GetMyTournaments(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	h.mutex.RLock()
	defer h.mutex.RUnlock()

	myTournaments := make([]gin.H, 0)
	for tournamentID, participants := range h.participants {
		for _, p := range participants {
			if p.UserID == userID.(int64) {
				tournament := h.tournaments[tournamentID]
				myTournaments = append(myTournaments, gin.H{
					"tournament":  tournament,
					"participant": p,
				})
				break
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"tournaments": myTournaments})
}
