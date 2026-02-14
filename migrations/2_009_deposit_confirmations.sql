-- Confirmaciones de depósito
CREATE TABLE IF NOT EXISTS deposit_confirmations (
    id SERIAL PRIMARY KEY,
    deposit_id INTEGER REFERENCES deposit_requests(id) ON DELETE CASCADE,
    accountant_id INTEGER REFERENCES accountants(id),
    action VARCHAR(20) NOT NULL,
    verified_tx_hash BOOLEAN DEFAULT false,
    verified_amount BOOLEAN DEFAULT false,
    verified_source BOOLEAN DEFAULT false,
    notes TEXT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_deposit_confirmations_deposit ON deposit_confirmations(deposit_id);
CREATE INDEX IF NOT EXISTS idx_deposit_confirmations_accountant ON deposit_confirmations(accountant_id);
