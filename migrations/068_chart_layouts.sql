-- Layouts de gráficos guardados por el usuario
CREATE TABLE IF NOT EXISTS chart_layouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(20),
    timeframe VARCHAR(10),
    chart_type VARCHAR(20) DEFAULT 'candles',
    indicators JSONB,
    drawings JSONB,
    split_mode VARCHAR(20) DEFAULT 'single',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chart_layouts_user_id ON chart_layouts(user_id);
