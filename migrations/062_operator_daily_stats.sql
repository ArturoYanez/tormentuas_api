-- Estadísticas diarias del operador
CREATE TABLE IF NOT EXISTS operator_daily_stats (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    login_time TIME,
    logout_time TIME,
    active_minutes INTEGER DEFAULT 0,
    actions_count INTEGER DEFAULT 0,
    alerts_handled INTEGER DEFAULT 0,
    chat_messages INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_daily_stats_operator ON operator_daily_stats(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_daily_stats_date ON operator_daily_stats(date);
