-- Historial de tipos de cambio
CREATE TABLE IF NOT EXISTS exchange_rate_history (
    id SERIAL PRIMARY KEY,
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    rate DECIMAL(18,8) NOT NULL,
    rate_date DATE NOT NULL,
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exchange_rate_history_currencies ON exchange_rate_history(from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rate_history_date ON exchange_rate_history(rate_date);
