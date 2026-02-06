package handlers

import (
	"net/http"
	"strconv"
	"tormentus/internal/models"
	"tormentus/internal/repositories"

	"github.com/gin-gonic/gin"
)

type ChartHandler struct {
	chartRepo repositories.ChartRepository
}

func NewChartHandler(chartRepo repositories.ChartRepository) *ChartHandler {
	return &ChartHandler{chartRepo: chartRepo}
}

// === DRAWINGS ===

func (h *ChartHandler) CreateDrawing(c *gin.Context) {
	userID := c.GetInt64("user_id")

	var drawing models.ChartDrawing
	if err := c.ShouldBindJSON(&drawing); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}
	drawing.UserID = userID

	if err := h.chartRepo.CreateDrawing(&drawing); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error guardando dibujo"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"drawing": drawing})
}

func (h *ChartHandler) GetDrawings(c *gin.Context) {
	userID := c.GetInt64("user_id")
	symbol := c.Query("symbol")

	if symbol == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Símbolo requerido"})
		return
	}

	drawings, err := h.chartRepo.GetDrawings(userID, symbol)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo dibujos"})
		return
	}

	if drawings == nil {
		drawings = []*models.ChartDrawing{}
	}

	c.JSON(http.StatusOK, gin.H{"drawings": drawings})
}

func (h *ChartHandler) DeleteDrawing(c *gin.Context) {
	userID := c.GetInt64("user_id")
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.chartRepo.DeleteDrawing(id, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando dibujo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Dibujo eliminado"})
}

func (h *ChartHandler) ClearDrawings(c *gin.Context) {
	userID := c.GetInt64("user_id")
	symbol := c.Query("symbol")

	if symbol == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Símbolo requerido"})
		return
	}

	if err := h.chartRepo.DeleteAllDrawings(userID, symbol); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando dibujos"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Dibujos eliminados"})
}

// === FAVORITES ===

func (h *ChartHandler) GetFavorites(c *gin.Context) {
	userID := c.GetInt64("user_id")

	favorites, err := h.chartRepo.GetFavorites(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo favoritos"})
		return
	}

	if favorites == nil {
		favorites = []*models.UserFavorite{}
	}

	c.JSON(http.StatusOK, gin.H{"favorites": favorites})
}

func (h *ChartHandler) AddFavorite(c *gin.Context) {
	userID := c.GetInt64("user_id")

	var req struct {
		Symbol string `json:"symbol" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Símbolo requerido"})
		return
	}

	if err := h.chartRepo.AddFavorite(userID, req.Symbol); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error agregando favorito"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Favorito agregado"})
}

func (h *ChartHandler) RemoveFavorite(c *gin.Context) {
	userID := c.GetInt64("user_id")

	var req struct {
		Symbol string `json:"symbol" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Símbolo requerido"})
		return
	}

	if err := h.chartRepo.RemoveFavorite(userID, req.Symbol); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando favorito"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Favorito eliminado"})
}

func (h *ChartHandler) ReorderFavorites(c *gin.Context) {
	userID := c.GetInt64("user_id")

	var req struct {
		Symbols []string `json:"symbols" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Lista de símbolos requerida"})
		return
	}

	if err := h.chartRepo.ReorderFavorites(userID, req.Symbols); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reordenando favoritos"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Favoritos reordenados"})
}

// === LAYOUTS ===

func (h *ChartHandler) GetLayouts(c *gin.Context) {
	userID := c.GetInt64("user_id")

	layouts, err := h.chartRepo.GetLayouts(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo layouts"})
		return
	}

	if layouts == nil {
		layouts = []*models.ChartLayout{}
	}

	c.JSON(http.StatusOK, gin.H{"layouts": layouts})
}

func (h *ChartHandler) SaveLayout(c *gin.Context) {
	userID := c.GetInt64("user_id")

	var layout models.ChartLayout
	if err := c.ShouldBindJSON(&layout); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}
	layout.UserID = userID

	if err := h.chartRepo.SaveLayout(&layout); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error guardando layout"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"layout": layout, "message": "Layout guardado"})
}

func (h *ChartHandler) DeleteLayout(c *gin.Context) {
	userID := c.GetInt64("user_id")
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.chartRepo.DeleteLayout(id, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando layout"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Layout eliminado"})
}

func (h *ChartHandler) SetDefaultLayout(c *gin.Context) {
	userID := c.GetInt64("user_id")
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.chartRepo.SetDefaultLayout(id, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error estableciendo layout predeterminado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Layout predeterminado establecido"})
}

// === INDICATORS ===

func (h *ChartHandler) GetIndicators(c *gin.Context) {
	userID := c.GetInt64("user_id")
	symbol := c.DefaultQuery("symbol", "*")

	indicators, err := h.chartRepo.GetIndicators(userID, symbol)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo indicadores"})
		return
	}

	if indicators == nil {
		indicators = []*models.ChartIndicator{}
	}

	c.JSON(http.StatusOK, gin.H{"indicators": indicators})
}

func (h *ChartHandler) SaveIndicator(c *gin.Context) {
	userID := c.GetInt64("user_id")

	var indicator models.ChartIndicator
	if err := c.ShouldBindJSON(&indicator); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}
	indicator.UserID = userID

	if err := h.chartRepo.SaveIndicator(&indicator); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error guardando indicador"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"indicator": indicator, "message": "Indicador guardado"})
}

func (h *ChartHandler) ToggleIndicator(c *gin.Context) {
	userID := c.GetInt64("user_id")
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.chartRepo.ToggleIndicator(id, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando indicador"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Indicador actualizado"})
}

func (h *ChartHandler) DeleteIndicator(c *gin.Context) {
	userID := c.GetInt64("user_id")
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.chartRepo.DeleteIndicator(id, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando indicador"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Indicador eliminado"})
}

// === TRADE MARKERS ===

func (h *ChartHandler) GetTradeMarkers(c *gin.Context) {
	userID := c.GetInt64("user_id")
	symbol := c.Query("symbol")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	if symbol == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Símbolo requerido"})
		return
	}

	markers, err := h.chartRepo.GetTradeMarkers(userID, symbol, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo marcadores"})
		return
	}

	if markers == nil {
		markers = []*models.TradeMarker{}
	}

	c.JSON(http.StatusOK, gin.H{"markers": markers})
}
