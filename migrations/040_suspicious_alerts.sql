-- Alertas sospechosas
CREATE TABLE IF NOT EXISTS suspicious_alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    amount DECIMAL(15,2),
    reason TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    related_transaction_id INTEGER,
    related_transaction_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    reviewed BOOLEAN DEFAULT false,
    reviewed_by INTEGER REFERENCES accountants(id),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    action_taken VARCHAR(100),
    escalated BOOLEAN DEFAULT false,
    escalated_to INTEGER REFERENCES users(id),
    escalated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suspicious_alerts_user ON suspicious_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_alerts_status ON suspicious_alerts(status);
CREATE INDEX IF NOT EXISTS idx_suspicious_alerts_severity ON suspicious_alerts(severity);
