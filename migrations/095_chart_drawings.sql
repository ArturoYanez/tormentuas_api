-- Chart Drawings - Dibujos en el gráfico
CREATE TABLE IF NOT EXISTS chart_drawings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    type VARCHAR(30) NOT NULL, -- horizontal, trend, fibonacci, rectangle, alert
    data JSONB DEFAULT '{}',
    color VARCHAR(20) DEFAULT '#8b5cf6',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chart_drawings_user_symbol ON chart_drawings(user_id, symbol);
