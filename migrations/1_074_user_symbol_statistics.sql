-- Estadísticas por símbolo del usuario
CREATE TABLE IF NOT EXISTS user_symbol_statistics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    trades_count INTEGER DEFAULT 0,
    won_count INTEGER DEFAULT 0,
    lost_count INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    total_profit DECIMAL(18,8) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_symbol_statistics_user_id ON user_symbol_statistics(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_symbol_statistics_unique ON user_symbol_statistics(user_id, symbol);
