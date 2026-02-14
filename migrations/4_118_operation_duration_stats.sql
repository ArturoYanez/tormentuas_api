-- Estadísticas por duración
CREATE TABLE IF NOT EXISTS operation_duration_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    duration_seconds INTEGER NOT NULL,
    total_trades INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    total_volume DECIMAL(18,8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operation_duration_stats_date ON operation_duration_stats(date);
