package trading

import (
	"context"
	"log"
	"sync"
	"time"

	"tormentus/internal/models"
	"tormentus/internal/websocket"

	"github.com/jackc/pgx/v5/pgxpool"
)

// TradeRepository interface para persistencia
type TradeRepository interface {
	CreateTrade(ctx context.Context, trade *models.Trade) error
	UpdateTrade(ctx context.Context, trade *models.Trade) error
	GetRecentWinners(ctx context.Context, hours int) ([]int64, error)
}

// UserRepository interface para actualizar balances
type UserRepository interface {
	UpdateBalance(ctx context.Context, userID int64, amount float64, isDemo bool) error
	UpdateTradeStats(ctx context.Context, userID int64, won bool) error
	GetBalance(ctx context.Context, userID int64, isDemo bool) (float64, error)
}

// TradingEngine maneja todas las operaciones de trading
type TradingEngine struct {
	hub           *websocket.Hub
	algorithm     *TradingAlgorithm
	activeTrades  map[int64]*models.Trade // tradeID -> trade
	mutex         sync.RWMutex
	tradeRepo     TradeRepository
	userRepo      UserRepository
	dbPool        *pgxpool.Pool
	
	// Canales para procesamiento
	newTrades     chan *models.Trade
	closingTrades chan *models.Trade
}

// NewTradingEngine crea un nuevo motor de trading
func NewTradingEngine(hub *websocket.Hub, dbPool *pgxpool.Pool, tradeRepo TradeRepository, userRepo UserRepository) *TradingEngine {
	return &TradingEngine{
		hub:           hub,
		algorithm:     NewTradingAlgorithm(),
		activeTrades:  make(map[int64]*models.Trade),
		newTrades:     make(chan *models.Trade, 100),
		closingTrades: make(chan *models.Trade, 100),
		tradeRepo:     tradeRepo,
		userRepo:      userRepo,
		dbPool:        dbPool,
	}
}

// Start inicia el motor de trading
func (te *TradingEngine) Start(ctx context.Context) {
	log.Println("Motor de trading iniciado")
	
	// Goroutine para procesar nuevos trades
	go te.processNewTrades(ctx)
	
	// Goroutine para cerrar trades expirados
	go te.processExpiringTrades(ctx)
	
	// Goroutine para limpiar registros antiguos
	go te.cleanupRoutine(ctx)
}

// PlaceTrade coloca una nueva operación
func (te *TradingEngine) PlaceTrade(trade *models.Trade) error {
	te.mutex.Lock()
	te.activeTrades[trade.ID] = trade
	te.mutex.Unlock()

	te.newTrades <- trade
	
	log.Printf("Nueva operación: ID=%d, Usuario=%d, Símbolo=%s, Dirección=%s, Monto=%.2f",
		trade.ID, trade.UserID, trade.Symbol, trade.Direction, trade.Amount)
	
	return nil
}

// processNewTrades procesa nuevas operaciones
func (te *TradingEngine) processNewTrades(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case trade := <-te.newTrades:
			// Programar cierre del trade
			go te.scheduleTradeClose(trade)
		}
	}
}

// scheduleTradeClose programa el cierre de un trade
func (te *TradingEngine) scheduleTradeClose(trade *models.Trade) {
	duration := time.Until(trade.ExpiresAt)
	if duration <= 0 {
		duration = time.Second
	}

	timer := time.NewTimer(duration)
	<-timer.C

	te.closingTrades <- trade
}

// processExpiringTrades procesa trades que están por expirar
func (te *TradingEngine) processExpiringTrades(ctx context.Context) {
	// Acumular trades que expiran en el mismo segundo
	ticker := time.NewTicker(time.Second)
	pendingTrades := make([]*models.Trade, 0)

	for {
		select {
		case <-ctx.Done():
			return
		case trade := <-te.closingTrades:
			pendingTrades = append(pendingTrades, trade)
		case <-ticker.C:
			if len(pendingTrades) > 0 {
				te.processTradeGroup(pendingTrades)
				pendingTrades = make([]*models.Trade, 0)
			}
		}
	}
}

// processTradeGroup procesa un grupo de trades que expiran juntos
func (te *TradingEngine) processTradeGroup(trades []*models.Trade) {
	if len(trades) == 0 {
		return
	}

	log.Printf("Procesando grupo de %d trades", len(trades))

	// Aplicar algoritmo de manipulación
	processedTrades := te.algorithm.ProcessTradeResults(trades)

	ctx := context.Background()

	// Actualizar trades y notificar usuarios
	for _, trade := range processedTrades {
		te.mutex.Lock()
		delete(te.activeTrades, trade.ID)
		te.mutex.Unlock()

		// Persistir resultado en DB
		if te.tradeRepo != nil {
			if err := te.tradeRepo.UpdateTrade(ctx, trade); err != nil {
				log.Printf("Error actualizando trade en DB: %v", err)
			}
		}

		// Actualizar balance del usuario
		if te.userRepo != nil {
			balanceChange := trade.Profit
			if trade.Status == models.TradeWon {
				balanceChange = trade.Amount + trade.Profit // Devolver monto + ganancia
			}
			
			if err := te.userRepo.UpdateBalance(ctx, trade.UserID, balanceChange, trade.IsDemo); err != nil {
				log.Printf("Error actualizando balance: %v", err)
			}
			
			// Actualizar estadísticas
			if err := te.userRepo.UpdateTradeStats(ctx, trade.UserID, trade.Status == models.TradeWon); err != nil {
				log.Printf("Error actualizando stats: %v", err)
			}
		}

		// Notificar al usuario via WebSocket
		te.hub.BroadcastTradeResult(trade.UserID, trade)

		log.Printf("Trade cerrado: ID=%d, Usuario=%d, Resultado=%s, Profit=%.2f",
			trade.ID, trade.UserID, trade.Status, trade.Profit)
	}
}

// GetActiveTrades obtiene los trades activos de un usuario
func (te *TradingEngine) GetActiveTrades(userID int64) []*models.Trade {
	te.mutex.RLock()
	defer te.mutex.RUnlock()

	trades := make([]*models.Trade, 0)
	for _, trade := range te.activeTrades {
		if trade.UserID == userID {
			trades = append(trades, trade)
		}
	}
	return trades
}

// GetActiveTradeCount obtiene el número de trades activos
func (te *TradingEngine) GetActiveTradeCount() int {
	te.mutex.RLock()
	defer te.mutex.RUnlock()
	return len(te.activeTrades)
}

// cleanupRoutine limpia registros antiguos periódicamente
func (te *TradingEngine) cleanupRoutine(ctx context.Context) {
	ticker := time.NewTicker(time.Hour)
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			te.algorithm.CleanupOldRecords()
		}
	}
}

// CancelTrade cancela un trade activo
func (te *TradingEngine) CancelTrade(tradeID int64, userID int64) error {
	te.mutex.Lock()
	defer te.mutex.Unlock()

	trade, exists := te.activeTrades[tradeID]
	if !exists {
		return nil
	}

	if trade.UserID != userID {
		return nil
	}

	trade.Status = models.TradeCanceled
	now := time.Now()
	trade.ClosedAt = &now
	delete(te.activeTrades, tradeID)

	return nil
}
