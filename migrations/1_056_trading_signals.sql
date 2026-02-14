-- Señales de trading
CREATE TABLE IF NOT EXISTS trading_signals (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    direction VARCHAR(10) NOT NULL,
    entry_price DECIMAL(18,8),
    take_profit DECIMAL(18,8),
    stop_loss DECIMAL(18,8),
    timeframe VARCHAR(20),
    confidence INTEGER,
    analysis TEXT,
    status VARCHAR(20) DEFAULT 'active',
    result VARCHAR(20),
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suscripciones a señales
CREATE TABLE IF NOT EXISTS signal_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active',
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trading_signals_provider_id ON trading_signals(provider_id);
CREATE INDEX IF NOT EXISTS idx_trading_signals_symbol ON trading_signals(symbol);
CREATE INDEX IF NOT EXISTS idx_trading_signals_status ON trading_signals(status);
CREATE INDEX IF NOT EXISTS idx_signal_subscriptions_user_id ON signal_subscriptions(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_signal_subscriptions_unique ON signal_subscriptions(user_id, provider_id);
