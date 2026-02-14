-- Transacciones financieras de usuarios
CREATE TABLE IF NOT EXISTS user_financial_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    balance_before DECIMAL(15,2),
    balance_after DECIMAL(15,2),
    reference_id INTEGER,
    reference_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'completed',
    details TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_financial_transactions_user ON user_financial_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_financial_transactions_type ON user_financial_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_user_financial_transactions_date ON user_financial_transactions(created_at);
