-- Ticks de precio en tiempo real
CREATE TABLE IF NOT EXISTS price_ticks (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(18,8) NOT NULL,
    bid DECIMAL(18,8),
    ask DECIMAL(18,8),
    volume DECIMAL(18,8),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_price_ticks_symbol ON price_ticks(symbol);
CREATE INDEX IF NOT EXISTS idx_price_ticks_timestamp ON price_ticks(timestamp);
