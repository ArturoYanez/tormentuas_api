package repositories

import (
	"context"
	"encoding/json"
	"tormentus/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresChartRepository struct {
	db *pgxpool.Pool
}

func NewPostgresChartRepository(db *pgxpool.Pool) *PostgresChartRepository {
	return &PostgresChartRepository{db: db}
}

// CreateDrawing crea un nuevo dibujo en el gráfico
func (r *PostgresChartRepository) CreateDrawing(drawing *models.ChartDrawing) error {
	dataJSON, _ := json.Marshal(drawing.Data)
	
	query := `
		INSERT INTO chart_drawings (user_id, symbol, type, data, color, created_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		RETURNING id, created_at`
	
	return r.db.QueryRow(context.Background(), query,
		drawing.UserID, drawing.Symbol, drawing.Type, dataJSON, drawing.Color,
	).Scan(&drawing.ID, &drawing.CreatedAt)
}

// GetDrawings obtiene los dibujos de un usuario para un símbolo
func (r *PostgresChartRepository) GetDrawings(userID int64, symbol string) ([]*models.ChartDrawing, error) {
	query := `
		SELECT id, user_id, symbol, type, data, color, created_at
		FROM chart_drawings
		WHERE user_id = $1 AND symbol = $2
		ORDER BY created_at ASC`
	
	rows, err := r.db.Query(context.Background(), query, userID, symbol)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var drawings []*models.ChartDrawing
	for rows.Next() {
		var d models.ChartDrawing
		var dataJSON []byte
		if err := rows.Scan(&d.ID, &d.UserID, &d.Symbol, &d.Type, &dataJSON, &d.Color, &d.CreatedAt); err != nil {
			continue
		}
		if len(dataJSON) > 0 {
			json.Unmarshal(dataJSON, &d.Data)
		}
		drawings = append(drawings, &d)
	}
	return drawings, nil
}

// DeleteDrawing elimina un dibujo
func (r *PostgresChartRepository) DeleteDrawing(id int64, userID int64) error {
	query := `DELETE FROM chart_drawings WHERE id = $1 AND user_id = $2`
	_, err := r.db.Exec(context.Background(), query, id, userID)
	return err
}

// DeleteAllDrawings elimina todos los dibujos de un símbolo
func (r *PostgresChartRepository) DeleteAllDrawings(userID int64, symbol string) error {
	query := `DELETE FROM chart_drawings WHERE user_id = $1 AND symbol = $2`
	_, err := r.db.Exec(context.Background(), query, userID, symbol)
	return err
}

// AddFavorite agrega un par a favoritos
func (r *PostgresChartRepository) AddFavorite(userID int64, symbol string) error {
	// Obtener la posición máxima actual
	var maxPos int
	r.db.QueryRow(context.Background(), 
		`SELECT COALESCE(MAX(position), 0) FROM user_favorites WHERE user_id = $1`, userID).Scan(&maxPos)
	
	query := `
		INSERT INTO user_favorites (user_id, symbol, position, created_at)
		VALUES ($1, $2, $3, NOW())
		ON CONFLICT (user_id, symbol) DO NOTHING`
	
	_, err := r.db.Exec(context.Background(), query, userID, symbol, maxPos+1)
	return err
}

// RemoveFavorite elimina un par de favoritos
func (r *PostgresChartRepository) RemoveFavorite(userID int64, symbol string) error {
	query := `DELETE FROM user_favorites WHERE user_id = $1 AND symbol = $2`
	_, err := r.db.Exec(context.Background(), query, userID, symbol)
	return err
}

// GetFavorites obtiene los pares favoritos de un usuario
func (r *PostgresChartRepository) GetFavorites(userID int64) ([]*models.UserFavorite, error) {
	query := `
		SELECT id, user_id, symbol, position, created_at
		FROM user_favorites
		WHERE user_id = $1
		ORDER BY position ASC`
	
	rows, err := r.db.Query(context.Background(), query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var favorites []*models.UserFavorite
	for rows.Next() {
		var f models.UserFavorite
		if err := rows.Scan(&f.ID, &f.UserID, &f.Symbol, &f.Position, &f.CreatedAt); err != nil {
			continue
		}
		favorites = append(favorites, &f)
	}
	return favorites, nil
}

// ReorderFavorites reordena los favoritos
func (r *PostgresChartRepository) ReorderFavorites(userID int64, symbols []string) error {
	ctx := context.Background()
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	for i, symbol := range symbols {
		_, err := tx.Exec(ctx, 
			`UPDATE user_favorites SET position = $1 WHERE user_id = $2 AND symbol = $3`,
			i+1, userID, symbol)
		if err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

// SaveLayout guarda un layout de gráfico
func (r *PostgresChartRepository) SaveLayout(layout *models.ChartLayout) error {
	settingsJSON, _ := json.Marshal(layout.Settings)
	
	if layout.ID > 0 {
		query := `
			UPDATE chart_layouts 
			SET name = $2, symbol = $3, timeframe = $4, settings = $5, updated_at = NOW()
			WHERE id = $1 AND user_id = $6`
		_, err := r.db.Exec(context.Background(), query,
			layout.ID, layout.Name, layout.Symbol, layout.Timeframe, settingsJSON, layout.UserID)
		return err
	}

	query := `
		INSERT INTO chart_layouts (user_id, name, symbol, timeframe, settings, is_default, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
		RETURNING id`
	
	return r.db.QueryRow(context.Background(), query,
		layout.UserID, layout.Name, layout.Symbol, layout.Timeframe, settingsJSON, layout.IsDefault,
	).Scan(&layout.ID)
}

// GetLayouts obtiene los layouts de un usuario
func (r *PostgresChartRepository) GetLayouts(userID int64) ([]*models.ChartLayout, error) {
	query := `
		SELECT id, user_id, name, symbol, timeframe, settings, is_default, created_at, updated_at
		FROM chart_layouts
		WHERE user_id = $1
		ORDER BY is_default DESC, updated_at DESC`
	
	rows, err := r.db.Query(context.Background(), query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var layouts []*models.ChartLayout
	for rows.Next() {
		var l models.ChartLayout
		var settingsJSON []byte
		if err := rows.Scan(&l.ID, &l.UserID, &l.Name, &l.Symbol, &l.Timeframe, &settingsJSON, &l.IsDefault, &l.CreatedAt, &l.UpdatedAt); err != nil {
			continue
		}
		if len(settingsJSON) > 0 {
			json.Unmarshal(settingsJSON, &l.Settings)
		}
		layouts = append(layouts, &l)
	}
	return layouts, nil
}

// GetLayout obtiene un layout específico
func (r *PostgresChartRepository) GetLayout(id int64, userID int64) (*models.ChartLayout, error) {
	query := `
		SELECT id, user_id, name, symbol, timeframe, settings, is_default, created_at, updated_at
		FROM chart_layouts
		WHERE id = $1 AND user_id = $2`
	
	var l models.ChartLayout
	var settingsJSON []byte
	err := r.db.QueryRow(context.Background(), query, id, userID).Scan(
		&l.ID, &l.UserID, &l.Name, &l.Symbol, &l.Timeframe, &settingsJSON, &l.IsDefault, &l.CreatedAt, &l.UpdatedAt)
	if err != nil {
		return nil, err
	}
	if len(settingsJSON) > 0 {
		json.Unmarshal(settingsJSON, &l.Settings)
	}
	return &l, nil
}

// DeleteLayout elimina un layout
func (r *PostgresChartRepository) DeleteLayout(id int64, userID int64) error {
	query := `DELETE FROM chart_layouts WHERE id = $1 AND user_id = $2`
	_, err := r.db.Exec(context.Background(), query, id, userID)
	return err
}

// SetDefaultLayout establece un layout como predeterminado
func (r *PostgresChartRepository) SetDefaultLayout(id int64, userID int64) error {
	ctx := context.Background()
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Quitar default de todos
	_, err = tx.Exec(ctx, `UPDATE chart_layouts SET is_default = false WHERE user_id = $1`, userID)
	if err != nil {
		return err
	}

	// Establecer el nuevo default
	_, err = tx.Exec(ctx, `UPDATE chart_layouts SET is_default = true WHERE id = $1 AND user_id = $2`, id, userID)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}


// SaveIndicator guarda un indicador
func (r *PostgresChartRepository) SaveIndicator(indicator *models.ChartIndicator) error {
	settingsJSON, _ := json.Marshal(indicator.Settings)
	
	if indicator.ID > 0 {
		query := `
			UPDATE chart_indicators SET settings = $2, enabled = $3 WHERE id = $1 AND user_id = $4`
		_, err := r.db.Exec(context.Background(), query, indicator.ID, settingsJSON, indicator.Enabled, indicator.UserID)
		return err
	}

	query := `
		INSERT INTO chart_indicators (user_id, symbol, name, settings, enabled, created_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		ON CONFLICT (user_id, symbol, name) DO UPDATE SET settings = $4, enabled = $5
		RETURNING id`
	
	return r.db.QueryRow(context.Background(), query,
		indicator.UserID, indicator.Symbol, indicator.Name, settingsJSON, indicator.Enabled,
	).Scan(&indicator.ID)
}

// GetIndicators obtiene los indicadores de un usuario para un símbolo
func (r *PostgresChartRepository) GetIndicators(userID int64, symbol string) ([]*models.ChartIndicator, error) {
	query := `
		SELECT id, user_id, symbol, name, settings, enabled, created_at
		FROM chart_indicators
		WHERE user_id = $1 AND (symbol = $2 OR symbol = '*')
		ORDER BY name ASC`
	
	rows, err := r.db.Query(context.Background(), query, userID, symbol)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var indicators []*models.ChartIndicator
	for rows.Next() {
		var i models.ChartIndicator
		var settingsJSON []byte
		if err := rows.Scan(&i.ID, &i.UserID, &i.Symbol, &i.Name, &settingsJSON, &i.Enabled, &i.CreatedAt); err != nil {
			continue
		}
		if len(settingsJSON) > 0 {
			json.Unmarshal(settingsJSON, &i.Settings)
		}
		indicators = append(indicators, &i)
	}
	return indicators, nil
}

// ToggleIndicator activa/desactiva un indicador
func (r *PostgresChartRepository) ToggleIndicator(id int64, userID int64) error {
	query := `UPDATE chart_indicators SET enabled = NOT enabled WHERE id = $1 AND user_id = $2`
	_, err := r.db.Exec(context.Background(), query, id, userID)
	return err
}

// DeleteIndicator elimina un indicador
func (r *PostgresChartRepository) DeleteIndicator(id int64, userID int64) error {
	query := `DELETE FROM chart_indicators WHERE id = $1 AND user_id = $2`
	_, err := r.db.Exec(context.Background(), query, id, userID)
	return err
}

// CreateTradeMarker crea un marcador de trade
func (r *PostgresChartRepository) CreateTradeMarker(marker *models.TradeMarker) error {
	query := `
		INSERT INTO trade_markers (trade_id, user_id, symbol, price, direction, amount, candle_time, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
		RETURNING id`
	
	return r.db.QueryRow(context.Background(), query,
		marker.TradeID, marker.UserID, marker.Symbol, marker.Price, marker.Direction, marker.Amount, marker.CandleTime,
	).Scan(&marker.ID)
}

// GetTradeMarkers obtiene los marcadores de trades
func (r *PostgresChartRepository) GetTradeMarkers(userID int64, symbol string, limit int) ([]*models.TradeMarker, error) {
	query := `
		SELECT id, trade_id, user_id, symbol, price, direction, amount, candle_time, created_at
		FROM trade_markers
		WHERE user_id = $1 AND symbol = $2
		ORDER BY created_at DESC
		LIMIT $3`
	
	rows, err := r.db.Query(context.Background(), query, userID, symbol, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var markers []*models.TradeMarker
	for rows.Next() {
		var m models.TradeMarker
		if err := rows.Scan(&m.ID, &m.TradeID, &m.UserID, &m.Symbol, &m.Price, &m.Direction, &m.Amount, &m.CandleTime, &m.CreatedAt); err != nil {
			continue
		}
		markers = append(markers, &m)
	}
	return markers, nil
}
