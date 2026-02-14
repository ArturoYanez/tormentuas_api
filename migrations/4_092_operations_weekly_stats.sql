-- Estadísticas semanales de operaciones
CREATE TABLE IF NOT EXISTS operations_weekly_stats (
    id SERIAL PRIMARY KEY,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    year INTEGER NOT NULL,
    week_number INTEGER NOT NULL,
    total_trades INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    total_volume DECIMAL(18,8) DEFAULT 0,
    avg_daily_volume DECIMAL(18,8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, week_number)
);

CREATE INDEX IF NOT EXISTS idx_operations_weekly_stats_week ON operations_weekly_stats(week_start);
