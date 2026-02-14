-- Sistema de cashback
CREATE TABLE IF NOT EXISTS cashback_config (
    id SERIAL PRIMARY KEY,
    user_level VARCHAR(50) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    min_loss DECIMAL(18,8) DEFAULT 0,
    max_cashback DECIMAL(18,8),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS user_cashback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_losses DECIMAL(18,8) DEFAULT 0,
    cashback_percentage DECIMAL(5,2),
    cashback_amount DECIMAL(18,8) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_cashback_user_id ON user_cashback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cashback_status ON user_cashback(status);
