-- Límites de aprobación del contador
CREATE TABLE IF NOT EXISTS accountant_approval_limits (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL,
    daily_limit DECIMAL(15,2),
    single_transaction_limit DECIMAL(15,2),
    require_second_approval_above DECIMAL(15,2),
    auto_approve_below DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(accountant_id, transaction_type)
);

CREATE INDEX IF NOT EXISTS idx_accountant_approval_limits_accountant ON accountant_approval_limits(accountant_id);
