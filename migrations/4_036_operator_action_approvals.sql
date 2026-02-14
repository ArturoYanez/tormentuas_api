-- Aprobaciones de acciones sensibles
CREATE TABLE IF NOT EXISTS operator_action_approvals (
    id SERIAL PRIMARY KEY,
    action_type VARCHAR(100) NOT NULL,
    requested_by INTEGER REFERENCES operators(id),
    approved_by INTEGER REFERENCES operators(id),
    target_type VARCHAR(50),
    target_id INTEGER,
    request_data JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    rejection_reason TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_action_approvals_requested ON operator_action_approvals(requested_by);
CREATE INDEX IF NOT EXISTS idx_operator_action_approvals_status ON operator_action_approvals(status);
