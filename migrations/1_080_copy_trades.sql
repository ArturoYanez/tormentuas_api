-- Operaciones copiadas
CREATE TABLE IF NOT EXISTS copy_trades (
    id SERIAL PRIMARY KEY,
    original_trade_id INTEGER REFERENCES trades(id),
    copied_trade_id INTEGER REFERENCES trades(id),
    follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    trader_id INTEGER REFERENCES copy_traders(id),
    copy_amount DECIMAL(18,8) NOT NULL,
    profit_share_amount DECIMAL(18,8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_copy_trades_follower_id ON copy_trades(follower_id);
CREATE INDEX IF NOT EXISTS idx_copy_trades_trader_id ON copy_trades(trader_id);
CREATE INDEX IF NOT EXISTS idx_copy_trades_original_trade_id ON copy_trades(original_trade_id);
