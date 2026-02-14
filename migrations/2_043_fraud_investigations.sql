-- Investigaciones de fraude
CREATE TABLE IF NOT EXISTS fraud_investigations (
    id SERIAL PRIMARY KEY,
    case_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    alert_ids INTEGER[],
    investigation_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_to INTEGER REFERENCES accountants(id),
    findings TEXT,
    evidence JSONB DEFAULT '[]',
    conclusion TEXT,
    action_taken VARCHAR(100),
    amount_involved DECIMAL(15,2),
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    closed_by INTEGER REFERENCES accountants(id)
);

CREATE INDEX IF NOT EXISTS idx_fraud_investigations_case ON fraud_investigations(case_number);
CREATE INDEX IF NOT EXISTS idx_fraud_investigations_user ON fraud_investigations(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_investigations_status ON fraud_investigations(status);
