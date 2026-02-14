-- Suspensiones financieras
CREATE TABLE IF NOT EXISTS user_financial_suspensions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    accountant_id INTEGER REFERENCES accountants(id),
    suspension_type VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    evidence JSONB DEFAULT '[]',
    suspended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lifted_at TIMESTAMP,
    lifted_by INTEGER REFERENCES accountants(id),
    lift_reason TEXT,
    is_permanent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_financial_suspensions_user ON user_financial_suspensions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_financial_suspensions_type ON user_financial_suspensions(suspension_type);
