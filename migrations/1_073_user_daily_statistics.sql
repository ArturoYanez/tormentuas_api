-- Estadísticas diarias del usuario
CREATE TABLE IF NOT EXISTS user_daily_statistics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    trades_count INTEGER DEFAULT 0,
    won_count INTEGER DEFAULT 0,
    lost_count INTEGER DEFAULT 0,
    volume DECIMAL(18,8) DEFAULT 0,
    profit DECIMAL(18,8) DEFAULT 0,
    loss DECIMAL(18,8) DEFAULT 0,
    net DECIMAL(18,8) DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_user_daily_statistics_user_id ON user_daily_statistics(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_daily_statistics_unique ON user_daily_statistics(user_id, date);
