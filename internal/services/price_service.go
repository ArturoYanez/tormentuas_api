package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"tormentus/internal/models"
	"tormentus/internal/websocket"
)

// PriceService maneja la obtención y distribución de precios
type PriceService struct {
	hub         *websocket.Hub
	httpClient  *http.Client
	prices      map[string]*models.PriceData
	mutex       sync.RWMutex
	
	// Configuración de APIs
	binanceWsURL string
	alphaVantageKey string
}

// NewPriceService crea un nuevo servicio de precios
func NewPriceService(hub *websocket.Hub) *PriceService {
	return &PriceService{
		hub:         hub,
		httpClient:  &http.Client{Timeout: 10 * time.Second},
		prices:      make(map[string]*models.PriceData),
		binanceWsURL: "wss://stream.binance.com:9443/ws",
	}
}

// Start inicia el servicio de precios
func (ps *PriceService) Start(ctx context.Context) {
	log.Println("Servicio de precios iniciado")
	
	// Iniciar generador de precios simulados para desarrollo
	go ps.startSimulatedPrices(ctx)
	
	// En producción, conectar a APIs reales:
	// go ps.connectBinanceWebSocket(ctx)
	// go ps.fetchForexPrices(ctx)
}

// startSimulatedPrices genera precios simulados para desarrollo
func (ps *PriceService) startSimulatedPrices(ctx context.Context) {
	// Precios base para diferentes activos
	basePrices := map[string]float64{
		// Crypto
		"BTC/USDT":  67500.00,
		"ETH/USDT":  3450.00,
		"BNB/USDT":  580.00,
		"SOL/USDT":  145.00,
		"XRP/USDT":  0.52,
		"DOGE/USDT": 0.12,
		"ADA/USDT":  0.45,
		"AVAX/USDT": 35.50,
		"DOT/USDT":  7.20,
		"LINK/USDT": 14.80,
		
		// Forex
		"EUR/USD": 1.0850,
		"GBP/USD": 1.2650,
		"USD/JPY": 154.50,
		"USD/CHF": 0.8820,
		"AUD/USD": 0.6520,
		"USD/CAD": 1.3650,
		"NZD/USD": 0.5980,
		"EUR/GBP": 0.8580,
		"EUR/JPY": 167.60,
		"GBP/JPY": 195.40,
		
		// Commodities
		"XAU/USD": 2340.00, // Oro
		"XAG/USD": 27.50,   // Plata
		"WTI/USD": 78.50,   // Petróleo WTI
		"BRENT/USD": 82.30, // Petróleo Brent
		"XPT/USD": 980.00,  // Platino
		"XPD/USD": 1050.00, // Paladio
		"NG/USD":  2.85,    // Gas Natural
		"COPPER/USD": 4.25, // Cobre
		
		// Stocks (índices/ETFs)
		"SPY/USD":  520.00,  // S&P 500 ETF
		"QQQ/USD":  445.00,  // Nasdaq ETF
		"DIA/USD":  390.00,  // Dow Jones ETF
		"AAPL/USD": 185.00,  // Apple
		"GOOGL/USD": 175.00, // Google
		"MSFT/USD": 420.00,  // Microsoft
		"AMZN/USD": 185.00,  // Amazon
		"TSLA/USD": 175.00,  // Tesla
		"NVDA/USD": 880.00,  // Nvidia
		"META/USD": 505.00,  // Meta
	}

	// Inicializar precios
	for symbol, basePrice := range basePrices {
		ps.prices[symbol] = &models.PriceData{
			Symbol:    symbol,
			Price:     basePrice,
			Bid:       basePrice * 0.9999,
			Ask:       basePrice * 1.0001,
			High24h:   basePrice * 1.02,
			Low24h:    basePrice * 0.98,
			Change24h: 0,
			Timestamp: time.Now(),
		}
	}

	ticker := time.NewTicker(500 * time.Millisecond) // Actualizar cada 500ms
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			ps.updateSimulatedPrices(basePrices)
		}
	}
}

// updateSimulatedPrices actualiza precios con variación aleatoria
func (ps *PriceService) updateSimulatedPrices(basePrices map[string]float64) {
	ps.mutex.Lock()
	defer ps.mutex.Unlock()

	for symbol, price := range ps.prices {
		// Variación aleatoria de -0.1% a +0.1%
		variation := (rand.Float64() - 0.5) * 0.002
		newPrice := price.Price * (1 + variation)
		
		// Mantener dentro de rango razonable (±5% del precio base)
		basePrice := basePrices[symbol]
		if newPrice > basePrice*1.05 {
			newPrice = basePrice * 1.05
		} else if newPrice < basePrice*0.95 {
			newPrice = basePrice * 0.95
		}

		price.Price = newPrice
		price.Bid = newPrice * 0.9999
		price.Ask = newPrice * 1.0001
		price.Change24h = ((newPrice - basePrice) / basePrice) * 100
		price.Timestamp = time.Now()

		// Actualizar high/low
		if newPrice > price.High24h {
			price.High24h = newPrice
		}
		if newPrice < price.Low24h {
			price.Low24h = newPrice
		}

		// Broadcast a clientes suscritos
		ps.hub.BroadcastPrice(price)
	}
}

// GetPrice obtiene el precio actual de un símbolo
func (ps *PriceService) GetPrice(symbol string) (*models.PriceData, error) {
	ps.mutex.RLock()
	defer ps.mutex.RUnlock()

	price, exists := ps.prices[symbol]
	if !exists {
		return nil, fmt.Errorf("símbolo no encontrado: %s", symbol)
	}
	return price, nil
}

// GetAllPrices obtiene todos los precios
func (ps *PriceService) GetAllPrices() map[string]*models.PriceData {
	ps.mutex.RLock()
	defer ps.mutex.RUnlock()

	result := make(map[string]*models.PriceData)
	for k, v := range ps.prices {
		result[k] = v
	}
	return result
}

// GetPricesByMarket obtiene precios por tipo de mercado
func (ps *PriceService) GetPricesByMarket(marketType models.MarketType) []*models.PriceData {
	ps.mutex.RLock()
	defer ps.mutex.RUnlock()

	var result []*models.PriceData
	
	cryptoSymbols := []string{"BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT", "XRP/USDT", 
		"DOGE/USDT", "ADA/USDT", "AVAX/USDT", "DOT/USDT", "LINK/USDT"}
	forexSymbols := []string{"EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", 
		"USD/CAD", "NZD/USD", "EUR/GBP", "EUR/JPY", "GBP/JPY"}
	commoditySymbols := []string{"XAU/USD", "XAG/USD", "WTI/USD", "BRENT/USD", 
		"XPT/USD", "XPD/USD", "NG/USD", "COPPER/USD"}
	stockSymbols := []string{"SPY/USD", "QQQ/USD", "DIA/USD", "AAPL/USD", "GOOGL/USD",
		"MSFT/USD", "AMZN/USD", "TSLA/USD", "NVDA/USD", "META/USD"}

	var symbols []string
	switch marketType {
	case models.MarketCrypto:
		symbols = cryptoSymbols
	case models.MarketForex:
		symbols = forexSymbols
	case models.MarketCommodities:
		symbols = commoditySymbols
	case models.MarketStocks:
		symbols = stockSymbols
	}

	for _, symbol := range symbols {
		if price, exists := ps.prices[symbol]; exists {
			result = append(result, price)
		}
	}

	return result
}

// SetManipulatedPrice establece un precio manipulado temporalmente
func (ps *PriceService) SetManipulatedPrice(symbol string, price float64) {
	ps.mutex.Lock()
	defer ps.mutex.Unlock()

	if priceData, exists := ps.prices[symbol]; exists {
		priceData.Price = price
		priceData.Bid = price * 0.9999
		priceData.Ask = price * 1.0001
		priceData.Timestamp = time.Now()
		
		ps.hub.BroadcastPrice(priceData)
	}
}

// BinanceTickerResponse respuesta de Binance
type BinanceTickerResponse struct {
	Symbol    string `json:"symbol"`
	Price     string `json:"price"`
	PriceChange string `json:"priceChange"`
	PriceChangePercent string `json:"priceChangePercent"`
	HighPrice string `json:"highPrice"`
	LowPrice  string `json:"lowPrice"`
	Volume    string `json:"volume"`
}

// FetchBinancePrices obtiene precios de Binance (para producción)
func (ps *PriceService) FetchBinancePrices() error {
	resp, err := ps.httpClient.Get("https://api.binance.com/api/v3/ticker/24hr")
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var tickers []BinanceTickerResponse
	if err := json.NewDecoder(resp.Body).Decode(&tickers); err != nil {
		return err
	}

	// Procesar y actualizar precios...
	log.Printf("Obtenidos %d precios de Binance", len(tickers))
	return nil
}
