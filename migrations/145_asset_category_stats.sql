-- Estadísticas por categoría de activo
CREATE TABLE IF NOT EXISTS asset_category_stats (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES asset_categories(id) ON DELETE CASCADE,
    period_date DATE NOT NULL,
    total_volume DECIMAL(18,8) DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    total_users INTEGER DEFAULT 0,
    avg_trade_size DECIMAL(18,8),
    platform_profit DECIMAL(18,8) DEFAULT 0,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_asset_category_stats_category ON asset_category_stats(category_id);
CREATE INDEX IF NOT EXISTS idx_asset_category_stats_date ON asset_category_stats(period_date);
