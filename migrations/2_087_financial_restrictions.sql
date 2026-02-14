-- Restricciones financieras
CREATE TABLE IF NOT EXISTS financial_restrictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    restriction_type VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    applied_by INTEGER REFERENCES accountants(id),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    lifted_at TIMESTAMP,
    lifted_by INTEGER REFERENCES accountants(id),
    lift_reason TEXT,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_financial_restrictions_user ON financial_restrictions(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_restrictions_active ON financial_restrictions(is_active);
CREATE INDEX IF NOT EXISTS idx_financial_restrictions_type ON financial_restrictions(restriction_type);
