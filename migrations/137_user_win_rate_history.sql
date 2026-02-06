-- Historial de tasa de victorias de usuarios
CREATE TABLE IF NOT EXISTS user_win_rate_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2),
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_win_rate_history_user ON user_win_rate_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_win_rate_history_period ON user_win_rate_history(period_start, period_end);
