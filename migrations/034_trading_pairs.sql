-- Pares de trading
CREATE TABLE IF NOT EXISTS trading_pairs (
    id SERIAL PRIMARY KEY,
    market_id INTEGER REFERENCES markets(id),
    symbol VARCHAR(20) UNIQUE NOT NULL,
    base_asset VARCHAR(10) NOT NULL,
    quote_asset VARCHAR(10) NOT NULL,
    payout_percentage DECIMAL(5,2) DEFAULT 85,
    min_amount DECIMAL(18,8) DEFAULT 1,
    max_amount DECIMAL(18,8) DEFAULT 10000,
    is_active BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    position INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_trading_pairs_market_id ON trading_pairs(market_id);
CREATE INDEX IF NOT EXISTS idx_trading_pairs_symbol ON trading_pairs(symbol);
CREATE INDEX IF NOT EXISTS idx_trading_pairs_is_active ON trading_pairs(is_active);
CREATE INDEX IF NOT EXISTS idx_trading_pairs_is_popular ON trading_pairs(is_popular);
