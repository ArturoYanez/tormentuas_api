-- Métricas de rendimiento del operador
CREATE TABLE IF NOT EXISTS operator_performance_metrics (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    alerts_resolved INTEGER DEFAULT 0,
    avg_resolution_time INTEGER,
    users_managed INTEGER DEFAULT 0,
    trades_reviewed INTEGER DEFAULT 0,
    tournaments_managed INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    login_hours DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_performance_metrics_operator ON operator_performance_metrics(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_performance_metrics_period ON operator_performance_metrics(period_start, period_end);
