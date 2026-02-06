-- Sobrescrituras de payout por usuario
CREATE TABLE IF NOT EXISTS user_payout_overrides (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id),
    symbol VARCHAR(20),
    payout_adjustment DECIMAL(5,2) NOT NULL,
    reason TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_payout_overrides_user ON user_payout_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payout_overrides_active ON user_payout_overrides(is_active);
