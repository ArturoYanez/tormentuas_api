-- Solicitudes de retiro
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    od_id VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    method VARCHAR(50) NOT NULL,
    network VARCHAR(50),
    wallet_address VARCHAR(255),
    bank_account_id INTEGER,
    user_balance_at_request DECIMAL(15,2),
    user_total_deposits DECIMAL(15,2),
    user_total_withdrawals DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'normal',
    risk_score INTEGER DEFAULT 0,
    risk_flags JSONB DEFAULT '[]',
    processed_by INTEGER REFERENCES accountants(id),
    processed_at TIMESTAMP,
    rejection_reason TEXT,
    tx_hash VARCHAR(255),
    fee_amount DECIMAL(15,4) DEFAULT 0,
    net_amount DECIMAL(15,2),
    notes TEXT,
    ip_address INET,
    device_info JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_date ON withdrawal_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_priority ON withdrawal_requests(priority);
