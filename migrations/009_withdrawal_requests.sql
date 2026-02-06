-- Solicitudes de retiro
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    wallet_id INTEGER REFERENCES wallets(id),
    amount DECIMAL(18,8) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    network VARCHAR(20),
    address VARCHAR(100) NOT NULL,
    fee DECIMAL(18,8) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    rejection_reason TEXT,
    processed_by INTEGER REFERENCES users(id),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON withdrawal_requests(created_at);
