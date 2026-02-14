-- Transacciones de cashback
CREATE TABLE IF NOT EXISTS cashback_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    trade_id INTEGER REFERENCES trades(id),
    amount DECIMAL(18,8) NOT NULL,
    percentage DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'pending',
    credited_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cashback_transactions_user_id ON cashback_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_cashback_transactions_status ON cashback_transactions(status);
