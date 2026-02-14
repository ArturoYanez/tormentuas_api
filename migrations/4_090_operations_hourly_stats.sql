-- Estadísticas horarias de operaciones
CREATE TABLE IF NOT EXISTS operations_hourly_stats (
    id SERIAL PRIMARY KEY,
    hour_start TIMESTAMP NOT NULL,
    total_trades INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    total_volume DECIMAL(18,8) DEFAULT 0,
    total_profit DECIMAL(18,8) DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operations_hourly_stats_hour ON operations_hourly_stats(hour_start);
