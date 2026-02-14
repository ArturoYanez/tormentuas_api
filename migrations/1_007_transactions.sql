-- Historial de transacciones
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    wallet_id INTEGER REFERENCES wallets(id),
    type VARCHAR(30) NOT NULL,
    amount DECIMAL(18,8) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending',
    tx_hash VARCHAR(100),
    address VARCHAR(100),
    network VARCHAR(20),
    fee DECIMAL(18,8) DEFAULT 0,
    notes TEXT,
    processed_by INTEGER REFERENCES users(id),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'transaction_type'
    ) THEN
        ALTER TABLE transactions RENAME COLUMN transaction_type TO type;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
