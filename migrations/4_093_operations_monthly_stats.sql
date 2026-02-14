-- Estadísticas mensuales de operaciones
CREATE TABLE IF NOT EXISTS operations_monthly_stats (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    total_trades INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    total_volume DECIMAL(18,8) DEFAULT 0,
    avg_daily_volume DECIMAL(18,8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, month)
);

CREATE INDEX IF NOT EXISTS idx_operations_monthly_stats_year ON operations_monthly_stats(year, month);
