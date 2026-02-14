-- Logs de auditoría
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id),
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    details TEXT,
    old_values JSONB,
    new_values JSONB,
    amount DECIMAL(15,2),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    risk_level VARCHAR(20) DEFAULT 'low',
    reviewed BOOLEAN DEFAULT false,
    reviewed_by INTEGER REFERENCES accountants(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'accountant_id'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN accountant_id INTEGER REFERENCES accountants(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_audit_logs_accountant ON audit_logs(accountant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_date ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
