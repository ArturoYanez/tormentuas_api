-- Sesiones de backtesting/replay
CREATE TABLE IF NOT EXISTS backtesting_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    speed DECIMAL(5,2) DEFAULT 1,
    trades_made INTEGER DEFAULT 0,
    profit_loss DECIMAL(18,8) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_backtesting_sessions_user_id ON backtesting_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_backtesting_sessions_status ON backtesting_sessions(status);
