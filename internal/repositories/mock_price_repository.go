package repositories

import (
	"context"
	"tormentus/internal/models"
)

// MockPriceRepository - Mock implementation for development
type MockPriceRepository struct{}

func NewMockPriceRepository() *MockPriceRepository {
	return &MockPriceRepository{}
}

func (m *MockPriceRepository) SavePriceData(ctx context.Context, priceData *models.PriceData) error {
	// Mock implementation - just log the data
	return nil
}

func (m *MockPriceRepository) GetLatestPrice(ctx context.Context, symbol string) (*models.PriceData, error) {
	// Mock implementation - return nil
	return nil, nil
}
