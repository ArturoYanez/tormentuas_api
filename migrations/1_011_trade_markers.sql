-- Marcadores de operaciones en el gráfico
CREATE TABLE IF NOT EXISTS trade_markers (
    id SERIAL PRIMARY KEY,
    trade_id INTEGER REFERENCES trades(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(18,8) NOT NULL,
    direction VARCHAR(10) NOT NULL,
    amount DECIMAL(18,8) NOT NULL,
    candle_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trade_markers_trade_id ON trade_markers(trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_markers_user_id ON trade_markers(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_markers_symbol ON trade_markers(symbol);
