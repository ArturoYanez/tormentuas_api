-- Logs de actividad del contador
CREATE TABLE IF NOT EXISTS accountant_activity_logs (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accountant_activity_logs_accountant ON accountant_activity_logs(accountant_id);
CREATE INDEX IF NOT EXISTS idx_accountant_activity_logs_type ON accountant_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_accountant_activity_logs_date ON accountant_activity_logs(created_at);
