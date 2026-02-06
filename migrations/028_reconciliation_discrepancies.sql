-- Discrepancias de conciliación
CREATE TABLE IF NOT EXISTS reconciliation_discrepancies (
    id SERIAL PRIMARY KEY,
    reconciliation_id INTEGER REFERENCES reconciliations(id) ON DELETE CASCADE,
    discrepancy_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    root_cause TEXT,
    resolution TEXT,
    status VARCHAR(20) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_to INTEGER REFERENCES accountants(id),
    resolved_by INTEGER REFERENCES accountants(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_discrepancies_reconciliation ON reconciliation_discrepancies(reconciliation_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_discrepancies_status ON reconciliation_discrepancies(status);
