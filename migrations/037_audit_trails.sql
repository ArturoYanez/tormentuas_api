-- Rastros de auditoría
CREATE TABLE IF NOT EXISTS audit_trails (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER,
    transaction_type VARCHAR(50) NOT NULL,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    performed_by INTEGER REFERENCES users(id),
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20),
    notes TEXT,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_audit_trails_transaction ON audit_trails(transaction_id, transaction_type);
CREATE INDEX IF NOT EXISTS idx_audit_trails_performer ON audit_trails(performed_by);
