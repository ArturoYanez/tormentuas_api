package repositories

import "tormentus/internal/models"

// ChartRepository interface para gráficos y favoritos
type ChartRepository interface {
	// Drawings
	CreateDrawing(drawing *models.ChartDrawing) error
	GetDrawings(userID int64, symbol string) ([]*models.ChartDrawing, error)
	DeleteDrawing(id int64, userID int64) error
	DeleteAllDrawings(userID int64, symbol string) error

	// Favorites
	AddFavorite(userID int64, symbol string) error
	RemoveFavorite(userID int64, symbol string) error
	GetFavorites(userID int64) ([]*models.UserFavorite, error)
	ReorderFavorites(userID int64, symbols []string) error

	// Layouts
	SaveLayout(layout *models.ChartLayout) error
	GetLayouts(userID int64) ([]*models.ChartLayout, error)
	GetLayout(id int64, userID int64) (*models.ChartLayout, error)
	DeleteLayout(id int64, userID int64) error
	SetDefaultLayout(id int64, userID int64) error

	// Indicators
	SaveIndicator(indicator *models.ChartIndicator) error
	GetIndicators(userID int64, symbol string) ([]*models.ChartIndicator, error)
	ToggleIndicator(id int64, userID int64) error
	DeleteIndicator(id int64, userID int64) error

	// Trade Markers
	CreateTradeMarker(marker *models.TradeMarker) error
	GetTradeMarkers(userID int64, symbol string, limit int) ([]*models.TradeMarker, error)
}
