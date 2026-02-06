-- Diario de trading del usuario
CREATE TABLE IF NOT EXISTS trading_journal (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    trade_id INTEGER REFERENCES trades(id),
    entry_reason TEXT,
    exit_reason TEXT,
    emotions VARCHAR(50),
    lessons_learned TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trading_journal_user_id ON trading_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_journal_trade_id ON trading_journal(trade_id);
