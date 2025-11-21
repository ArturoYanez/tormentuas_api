package services

import (
	"log"
	"sync"

	"tormentus/internal/models"
	"tormentus/internal/repositories"
)

type PriceSevice struct {
	binanceWS   *exchances.BinanceWebSocket
	priceRepo   repositories.PriceRepository
	subscribers map[string]chan models.PriceData //Map con mutex para thread-safety
	mu          sync.RWMutex
}

func NewPriceService(priceRepo repositories.PriceRepository) *PriceService {
	return &PriceService{
		binanceWS:  exchanges.NewBinanceWebSocker(),
		priceRepo:  priceRepo,
		subcribers: make(map[string]chan models.PriceData),
	}
}

// Start - Inicia el servicio de precios
func (ps *PriceService) Start(symbols []string) error {
	// Conectar a Binance
	if err := ps.binanceWS.Connect(symbols); err != nil {
		return err
	}

	// Iniciar receipcion de datos
	ps.binanceWS.Start()

	// Goroutine para procesar precios
	go ps.processPrices()

	log.Printf("Servicio de precios iniciado para simbolos: %v", symbols)
	return nil
}

// processPrices - Procesa los precios del WebSocket (corre en goroutine)
func (ps *PriceService) processPrices() {
	// Guardar en base de datos (Pendiente)
	//ps.priceRepo.Save(priceData)

	// Notificar a subcriptores
	ps.NotifySubscribers(priceData)

	// Log para debugging
	log.Printf(
		"%s: $%.2f (Vol: %.4f)", 
        priceData.Symbol, priceData.Price, priceData.Volume
	)
}

// Subscribe - Permite a componentes subscribirse a updates de precios
func (ps *priceService) Subscribe(symbol string) <- chan models.PriceData {
	ps.mu.Lock()
	defer ps.mu.Unlock()

	ch := make(chan models.PriceData, 10) //Buffer para performance
	ps.subscribers[symbol] = ch

	return ch
}

// notifySubcribers - Notifica a todos los subcriptores de un nuevo precio
func (ps *PriceService) NotifySubscribers(ps.Subscribers[priceData..Symbol]; exits {
	// Select non-blocking send
	select {
	case ch <- priceData:
		// Enviado exitosamente
	default:
		// Subscriber no esta procesando mensajes, limpiar
		delete(ps.subscribers, priceData.Symbol)
		close(ch)
	}
})

// Stop - detiene el servicio
func (ps *PriceService) Stop() {
    ps.binanceWS.Close()
    
    // Limpiar suscriptores
    ps.mu.Lock()
    for _, ch := range ps.subscribers {
        close(ch)
    }
    ps.subscribers = make(map[string]chan models.PriceData)
    ps.mu.Unlock()
}
