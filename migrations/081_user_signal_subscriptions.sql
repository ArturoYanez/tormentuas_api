-- Suscripciones a señales
CREATE TABLE IF NOT EXISTS user_signal_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    signal_type VARCHAR(30) DEFAULT 'all',
    auto_trade BOOLEAN DEFAULT FALSE,
    auto_trade_amount DECIMAL(18,8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_signal_subscriptions_user_id ON user_signal_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_signal_subscriptions_is_active ON user_signal_subscriptions(is_active);
