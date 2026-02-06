-- Horarios de trading por mercado
CREATE TABLE IF NOT EXISTS trading_hours (
    id SERIAL PRIMARY KEY,
    market_id INTEGER REFERENCES markets(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_trading_hours_market_id ON trading_hours(market_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_trading_hours_unique ON trading_hours(market_id, day_of_week);
