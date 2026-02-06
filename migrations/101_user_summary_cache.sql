-- Cache de resumen de usuarios
CREATE TABLE IF NOT EXISTS user_summary_cache (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    total_balance DECIMAL(18,8) DEFAULT 0,
    demo_balance DECIMAL(18,8) DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    total_deposits DECIMAL(18,8) DEFAULT 0,
    total_withdrawals DECIMAL(18,8) DEFAULT 0,
    risk_level VARCHAR(20) DEFAULT 'low',
    last_trade_at TIMESTAMP,
    last_deposit_at TIMESTAMP,
    notes_count INTEGER DEFAULT 0,
    flags_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_summary_cache_user ON user_summary_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_user_summary_cache_risk ON user_summary_cache(risk_level);
