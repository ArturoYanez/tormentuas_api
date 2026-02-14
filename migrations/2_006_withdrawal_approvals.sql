-- Aprobaciones de retiros
CREATE TABLE IF NOT EXISTS withdrawal_approvals (
    id SERIAL PRIMARY KEY,
    withdrawal_id INTEGER REFERENCES withdrawal_requests(id) ON DELETE CASCADE,
    accountant_id INTEGER REFERENCES accountants(id),
    action VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2),
    reason TEXT,
    verification_method VARCHAR(50),
    verified_wallet BOOLEAN DEFAULT false,
    verified_balance BOOLEAN DEFAULT false,
    verified_kyc BOOLEAN DEFAULT false,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_approvals_withdrawal ON withdrawal_approvals(withdrawal_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_approvals_accountant ON withdrawal_approvals(accountant_id);
