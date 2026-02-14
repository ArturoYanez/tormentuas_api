-- Ajustes de balance de usuarios
CREATE TABLE IF NOT EXISTS user_balance_adjustments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    accountant_id INTEGER REFERENCES accountants(id),
    adjustment_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2),
    balance_after DECIMAL(15,2),
    reason TEXT NOT NULL,
    reference_id VARCHAR(100),
    reference_type VARCHAR(50),
    approved_by INTEGER REFERENCES accountants(id),
    approved_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_balance_adjustments_user ON user_balance_adjustments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_balance_adjustments_accountant ON user_balance_adjustments(accountant_id);
CREATE INDEX IF NOT EXISTS idx_user_balance_adjustments_status ON user_balance_adjustments(status);
