-- Detalles extendidos de activos
CREATE TABLE IF NOT EXISTS asset_details (
    id SERIAL PRIMARY KEY,
    trading_pair_id INTEGER NOT NULL,
    category_id INTEGER REFERENCES asset_categories(id),
    full_name VARCHAR(200),
    description TEXT,
    market_hours_start TIME,
    market_hours_end TIME,
    trading_days JSONB DEFAULT '[1,2,3,4,5]',
    min_spread DECIMAL(10,6),
    max_spread DECIMAL(10,6),
    tick_size DECIMAL(10,8),
    is_featured BOOLEAN DEFAULT FALSE,
    popularity_score INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_asset_details_pair ON asset_details(trading_pair_id);
CREATE INDEX IF NOT EXISTS idx_asset_details_category ON asset_details(category_id);
CREATE INDEX IF NOT EXISTS idx_asset_details_featured ON asset_details(is_featured);
