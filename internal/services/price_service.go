package services

import (
	"log"
	"sync"

	"tormentus/internal/exchanges"
	"tormentus/internal/models"
	"tormentus/internal/repositories"
)

type PriceService struct {
	binanceWS   *exchanges.BinanceWebSocket
	priceRepo   repositories.PriceRepository
	subscribers map[string]chan models.PriceData //Map con mutex para thread-safety
	mu          sync.RWMutex
}

func NewPriceService(priceRepo repositories.PriceRepository) *PriceService {
	return &PriceService{
		binanceWS:   exchanges.NewBinanceWebSocket(),
		priceRepo:   priceRepo,
		subscribers: make(map[string]chan models.PriceData),
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
	for priceData := range ps.binanceWS.GetPriceChannel() {
		// Guardar en base de datos (Pendiente)
		//ps.priceRepo.SavePriceData(ctx, &priceData)

		// Notificar a subcriptores
		ps.NotifySubscribers(priceData)

		// Log para debugging
		log.Printf(
			"%s: $%.2f (Vol: %.4f)",
			priceData.Symbol, priceData.Price, priceData.Volume,
		)
	}
}

// Subscribe - Permite a componentes subscribirse a updates de precios
func (ps *PriceService) Subscribe(symbol string) <-chan models.PriceData {
	ps.mu.Lock()
	defer ps.mu.Unlock()

	ch := make(chan models.PriceData, 10) //Buffer para performance
	ps.subscribers[symbol] = ch

	return ch
}

// NotifySubscribers - Notifica a todos los subcriptores de un nuevo precio
func (ps *PriceService) NotifySubscribers(priceData models.PriceData) {
	ps.mu.RLock()
	subscribers, exists := ps.subscribers[priceData.Symbol]
	ps.mu.RUnlock()

	if !exists {
		return
	}

	// Select non-blocking send
	select {
	case subscribers <- priceData:
		// Enviado exitosamente
	default:
		// Subscriber no esta procesando mensajes, limpiar
		ps.mu.Lock()
		delete(ps.subscribers, priceData.Symbol)
		close(subscribers)
		ps.mu.Unlock()
	}
}

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
