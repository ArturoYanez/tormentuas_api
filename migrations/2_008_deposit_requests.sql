-- Solicitudes de depósito
CREATE TABLE IF NOT EXISTS deposit_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    od_id VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    method VARCHAR(50) NOT NULL,
    network VARCHAR(50),
    tx_hash VARCHAR(255),
    from_address VARCHAR(255),
    to_address VARCHAR(255),
    confirmations INTEGER DEFAULT 0,
    required_confirmations INTEGER DEFAULT 3,
    status VARCHAR(20) DEFAULT 'pending',
    confirmed_by INTEGER REFERENCES accountants(id),
    confirmed_at TIMESTAMP,
    rejection_reason TEXT,
    credited_amount DECIMAL(15,2),
    fee_amount DECIMAL(15,4) DEFAULT 0,
    exchange_rate DECIMAL(15,8),
    notes TEXT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_deposit_requests_user ON deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON deposit_requests(status);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_date ON deposit_requests(created_at);
