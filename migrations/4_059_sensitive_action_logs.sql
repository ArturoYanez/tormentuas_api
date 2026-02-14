-- Registro de acciones sensibles
CREATE TABLE IF NOT EXISTS sensitive_action_logs (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id INTEGER,
    action_data JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    two_factor_verified BOOLEAN DEFAULT FALSE,
    approval_id INTEGER REFERENCES operator_action_approvals(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sensitive_action_logs_operator ON sensitive_action_logs(operator_id);
CREATE INDEX IF NOT EXISTS idx_sensitive_action_logs_type ON sensitive_action_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_sensitive_action_logs_date ON sensitive_action_logs(created_at);
