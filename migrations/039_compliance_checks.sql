-- Verificaciones de cumplimiento
CREATE TABLE IF NOT EXISTS compliance_checks (
    id SERIAL PRIMARY KEY,
    check_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    check_date DATE NOT NULL,
    result VARCHAR(20) NOT NULL,
    score INTEGER,
    findings JSONB DEFAULT '[]',
    performed_by INTEGER REFERENCES accountants(id),
    notes TEXT,
    next_check_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_compliance_checks_type ON compliance_checks(check_type);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_date ON compliance_checks(check_date);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_entity ON compliance_checks(entity_type, entity_id);
