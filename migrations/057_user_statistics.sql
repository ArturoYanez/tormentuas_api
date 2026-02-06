-- Estadísticas del usuario
CREATE TABLE IF NOT EXISTS user_statistics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    total_volume DECIMAL(18,8) DEFAULT 0,
    total_profit DECIMAL(18,8) DEFAULT 0,
    total_loss DECIMAL(18,8) DEFAULT 0,
    net_profit DECIMAL(18,8) DEFAULT 0,
    best_trade DECIMAL(18,8) DEFAULT 0,
    worst_trade DECIMAL(18,8) DEFAULT 0,
    average_trade DECIMAL(18,8) DEFAULT 0,
    longest_win_streak INTEGER DEFAULT 0,
    longest_loss_streak INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    favorite_symbol VARCHAR(20),
    favorite_direction VARCHAR(10),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);
