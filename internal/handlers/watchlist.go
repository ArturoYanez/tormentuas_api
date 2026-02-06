package handlers

import (
	"net/http"
	"tormentus/internal/repositories"

	"github.com/gin-gonic/gin"
)

type WatchlistHandler struct {
	watchlistRepo *repositories.PostgresWatchlistRepository
}

func NewWatchlistHandler(watchlistRepo *repositories.PostgresWatchlistRepository) *WatchlistHandler {
	return &WatchlistHandler{watchlistRepo: watchlistRepo}
}

func (h *WatchlistHandler) GetWatchlist(c *gin.Context) {
	userID, _ := c.Get("userID")

	watchlist, err := h.watchlistRepo.GetOrCreateDefault(c.Request.Context(), userID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo watchlist"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"watchlist": watchlist})
}

type ToggleSymbolRequest struct {
	Symbol string `json:"symbol" binding:"required"`
}

func (h *WatchlistHandler) AddSymbol(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req ToggleSymbolRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := c.Request.Context()

	watchlist, err := h.watchlistRepo.GetOrCreateDefault(ctx, userID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo watchlist"})
		return
	}

	if err := h.watchlistRepo.AddSymbol(ctx, watchlist.ID, req.Symbol); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error agregando símbolo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Símbolo agregado", "symbol": req.Symbol})
}

func (h *WatchlistHandler) RemoveSymbol(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req ToggleSymbolRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := c.Request.Context()

	watchlist, err := h.watchlistRepo.GetOrCreateDefault(ctx, userID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo watchlist"})
		return
	}

	if err := h.watchlistRepo.RemoveSymbol(ctx, watchlist.ID, req.Symbol); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando símbolo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Símbolo eliminado", "symbol": req.Symbol})
}
