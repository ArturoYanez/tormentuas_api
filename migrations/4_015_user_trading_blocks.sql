-- Bloqueos de trading de usuarios
CREATE TABLE IF NOT EXISTS user_trading_blocks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id),
    block_type VARCHAR(20) NOT NULL,
    blocked_symbols JSONB DEFAULT '[]',
    max_amount DECIMAL(18,8),
    reason TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_trading_blocks_user ON user_trading_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trading_blocks_active ON user_trading_blocks(is_active);
