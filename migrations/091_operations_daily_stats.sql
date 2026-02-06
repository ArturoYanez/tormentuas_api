-- Estadísticas diarias de operaciones
CREATE TABLE IF NOT EXISTS operations_daily_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_trades INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    total_volume DECIMAL(18,8) DEFAULT 0,
    total_profit DECIMAL(18,8) DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    avg_trade_amount DECIMAL(18,8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operations_daily_stats_date ON operations_daily_stats(date);
