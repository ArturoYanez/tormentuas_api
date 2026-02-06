-- Métricas de plataforma
CREATE TABLE IF NOT EXISTS platform_metrics (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    metric_hour INTEGER,
    total_balance DECIMAL(15,2) DEFAULT 0,
    total_deposits_24h DECIMAL(15,2) DEFAULT 0,
    total_withdrawals_24h DECIMAL(15,2) DEFAULT 0,
    pending_withdrawals DECIMAL(15,2) DEFAULT 0,
    pending_deposits DECIMAL(15,2) DEFAULT 0,
    active_users_24h INTEGER DEFAULT 0,
    trading_volume_24h DECIMAL(15,2) DEFAULT 0,
    total_commissions_24h DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, metric_hour)
);

CREATE INDEX IF NOT EXISTS idx_platform_metrics_date ON platform_metrics(metric_date);
