package handlers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"tormentus/internal/models"
	"tormentus/internal/services"
	"tormentus/internal/trading"

	"github.com/gin-gonic/gin"
)

// TradeRepository interface para persistencia
type TradeRepository interface {
	CreateTrade(ctx context.Context, trade *models.Trade) error
	GetTradeByID(ctx context.Context, id int64) (*models.Trade, error)
	GetUserTrades(ctx context.Context, userID int64, limit, offset int) ([]*models.Trade, error)
	GetActiveTrades(ctx context.Context, userID int64) ([]*models.Trade, error)
	GetUserTradeStats(ctx context.Context, userID int64) (*models.TradeStats, error)
}

// UserRepository interface para balances
type UserRepository interface {
	GetBalance(ctx context.Context, userID int64, isDemo bool) (float64, error)
	UpdateBalance(ctx context.Context, userID int64, amount float64, isDemo bool) error
}

// TradingHandler maneja las operaciones de trading
type TradingHandler struct {
	engine       *trading.TradingEngine
	priceService *services.PriceService
	tradeRepo    TradeRepository
	userRepo     UserRepository
}

// NewTradingHandler crea un nuevo handler de trading
func NewTradingHandler(engine *trading.TradingEngine, priceService *services.PriceService, tradeRepo TradeRepository, userRepo UserRepository) *TradingHandler {
	return &TradingHandler{
		engine:       engine,
		priceService: priceService,
		tradeRepo:    tradeRepo,
		userRepo:     userRepo,
	}
}

// PlaceTradeRequest request para colocar una operación
type PlaceTradeRequest struct {
	Symbol    string  `json:"symbol" binding:"required"`
	Direction string  `json:"direction" binding:"required,oneof=up down"`
	Amount    float64 `json:"amount" binding:"required,gt=0"`
	Duration  int     `json:"duration" binding:"required,min=30,max=3600"` // 30s a 1h
	IsDemo    bool    `json:"is_demo"`
}

// PlaceTrade coloca una nueva operación
func (h *TradingHandler) PlaceTrade(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	var req PlaceTradeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := c.Request.Context()

	// Verificar balance
	balance, err := h.userRepo.GetBalance(ctx, userID.(int64), req.IsDemo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo balance"})
		return
	}

	if req.Amount > balance {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Balance insuficiente",
			"code":  "INSUFFICIENT_BALANCE",
		})
		return
	}

	// Obtener precio actual
	priceData, err := h.priceService.GetPrice(req.Symbol)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Símbolo no válido"})
		return
	}

	// Crear trade
	trade := &models.Trade{
		UserID:     userID.(int64),
		Symbol:     req.Symbol,
		Direction:  models.TradeDirection(req.Direction),
		Amount:     req.Amount,
		EntryPrice: priceData.Price,
		Duration:   req.Duration,
		Status:     models.TradePending,
		Payout:     85.0, // 85% de ganancia
		IsDemo:     req.IsDemo,
		CreatedAt:  time.Now(),
		ExpiresAt:  time.Now().Add(time.Duration(req.Duration) * time.Second),
	}

	// Persistir trade en DB
	if err := h.tradeRepo.CreateTrade(ctx, trade); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando operación"})
		return
	}

	// Descontar del balance inmediatamente
	if err := h.userRepo.UpdateBalance(ctx, userID.(int64), -req.Amount, req.IsDemo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando balance"})
		return
	}

	// Colocar trade en el motor
	if err := h.engine.PlaceTrade(trade); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al colocar operación"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Operación colocada exitosamente",
		"trade":   trade,
	})
}

// GetActiveTrades obtiene las operaciones activas del usuario
func (h *TradingHandler) GetActiveTrades(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	// Obtener trades activos del motor (en memoria) + DB
	trades := h.engine.GetActiveTrades(userID.(int64))
	c.JSON(http.StatusOK, gin.H{"trades": trades})
}

// GetTradeHistory obtiene el historial de operaciones
func (h *TradingHandler) GetTradeHistory(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	limit := 50
	offset := 0
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}
	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	ctx := c.Request.Context()
	trades, err := h.tradeRepo.GetUserTrades(ctx, userID.(int64), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo historial"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"trades": trades})
}

// GetTradeStats obtiene estadísticas de trading del usuario
func (h *TradingHandler) GetTradeStats(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	ctx := c.Request.Context()
	stats, err := h.tradeRepo.GetUserTradeStats(ctx, userID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estadísticas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"stats": stats})
}

// CancelTrade cancela una operación activa
func (h *TradingHandler) CancelTrade(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	tradeIDStr := c.Param("id")
	tradeID, err := strconv.ParseInt(tradeIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de operación inválido"})
		return
	}

	if err := h.engine.CancelTrade(tradeID, userID.(int64)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al cancelar operación"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Operación cancelada"})
}

// GetPrices obtiene todos los precios
func (h *TradingHandler) GetPrices(c *gin.Context) {
	prices := h.priceService.GetAllPrices()
	c.JSON(http.StatusOK, gin.H{"prices": prices})
}

// GetPricesByMarket obtiene precios por mercado
func (h *TradingHandler) GetPricesByMarket(c *gin.Context) {
	marketType := c.Param("market")
	
	var mt models.MarketType
	switch marketType {
	case "crypto":
		mt = models.MarketCrypto
	case "forex":
		mt = models.MarketForex
	case "commodities":
		mt = models.MarketCommodities
	case "stocks":
		mt = models.MarketStocks
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Mercado no válido"})
		return
	}

	prices := h.priceService.GetPricesByMarket(mt)
	c.JSON(http.StatusOK, gin.H{"prices": prices})
}

// GetPrice obtiene el precio de un símbolo específico
func (h *TradingHandler) GetPrice(c *gin.Context) {
	symbol := c.Param("symbol")
	
	price, err := h.priceService.GetPrice(symbol)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"price": price})
}

// GetMarkets obtiene la lista de mercados disponibles
func (h *TradingHandler) GetMarkets(c *gin.Context) {
	markets := []gin.H{
		{
			"id":   "crypto",
			"name": "Criptomonedas",
			"icon": "₿",
			"pairs": []string{"BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT", "XRP/USDT",
				"DOGE/USDT", "ADA/USDT", "AVAX/USDT", "DOT/USDT", "LINK/USDT"},
		},
		{
			"id":   "forex",
			"name": "Forex",
			"icon": "💱",
			"pairs": []string{"EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD",
				"USD/CAD", "NZD/USD", "EUR/GBP", "EUR/JPY", "GBP/JPY"},
		},
		{
			"id":   "commodities",
			"name": "Materias Primas",
			"icon": "🥇",
			"pairs": []string{"XAU/USD", "XAG/USD", "WTI/USD", "BRENT/USD",
				"XPT/USD", "XPD/USD", "NG/USD", "COPPER/USD"},
		},
		{
			"id":   "stocks",
			"name": "Acciones",
			"icon": "📈",
			"pairs": []string{"SPY/USD", "QQQ/USD", "DIA/USD", "AAPL/USD", "GOOGL/USD",
				"MSFT/USD", "AMZN/USD", "TSLA/USD", "NVDA/USD", "META/USD"},
		},
	}

	c.JSON(http.StatusOK, gin.H{"markets": markets})
}

// GetCandles obtiene datos históricos de velas para un símbolo
func (h *TradingHandler) GetCandles(c *gin.Context) {
	symbol := c.Param("symbol")
	timeframe := c.DefaultQuery("timeframe", "1m")
	limitStr := c.DefaultQuery("limit", "100")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 || limit > 500 {
		limit = 100
	}

	// Obtener precio base del símbolo
	priceData, err := h.priceService.GetPrice(symbol)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Símbolo no encontrado"})
		return
	}

	// Determinar intervalo en milisegundos
	var intervalMs int64
	switch timeframe {
	case "1s":
		intervalMs = 1000
	case "5s":
		intervalMs = 5000
	case "1m":
		intervalMs = 60000
	case "5m":
		intervalMs = 300000
	case "15m":
		intervalMs = 900000
	case "1h":
		intervalMs = 3600000
	case "4h":
		intervalMs = 14400000
	case "1d":
		intervalMs = 86400000
	default:
		intervalMs = 60000
	}

	// Generar velas históricas basadas en el precio actual
	candles := generateHistoricalCandles(priceData.Price, limit, intervalMs)

	c.JSON(http.StatusOK, gin.H{
		"symbol":    symbol,
		"timeframe": timeframe,
		"candles":   candles,
	})
}

// Candle representa una vela OHLCV
type Candle struct {
	Time   int64   `json:"time"`
	Open   float64 `json:"open"`
	High   float64 `json:"high"`
	Low    float64 `json:"low"`
	Close  float64 `json:"close"`
	Volume float64 `json:"volume"`
}

// generateHistoricalCandles genera datos de velas simulados
func generateHistoricalCandles(basePrice float64, count int, intervalMs int64) []Candle {
	candles := make([]Candle, count)
	price := basePrice * 0.98
	now := time.Now().UnixMilli()

	for i := count - 1; i >= 0; i-- {
		volatility := basePrice * 0.003
		trend := float64(i%20-10) / 100 * volatility
		change := (float64(time.Now().UnixNano()%1000)/1000 - 0.48) * volatility + trend

		open := price
		close := price + change
		high := max(open, close) + float64(time.Now().UnixNano()%100)/100*volatility*0.5
		low := min(open, close) - float64(time.Now().UnixNano()%100)/100*volatility*0.5
		volume := float64(500000 + time.Now().UnixNano()%1000000)

		candles[count-1-i] = Candle{
			Time:   now - int64(i)*intervalMs,
			Open:   open,
			High:   high,
			Low:    low,
			Close:  close,
			Volume: volume,
		}
		price = close
	}

	return candles
}

func max(a, b float64) float64 {
	if a > b {
		return a
	}
	return b
}

func min(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}
