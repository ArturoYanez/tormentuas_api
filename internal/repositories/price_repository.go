package repositories

import (
	"context"
	"tormentus/internal/models"
)

// PriceRepository - interfaz para almacenar precios históricos
type PriceRepository interface {
	SavePriceData(ctx context.Context, priceData *models.PriceData) error
	GetLatestPrice(ctx context.Context, symbol string) (*models.PriceData, error)
}
