-- Conciliaciones
CREATE TABLE IF NOT EXISTS reconciliations (
    id SERIAL PRIMARY KEY,
    reconciliation_date DATE NOT NULL,
    period_start DATE,
    period_end DATE,
    expected_balance DECIMAL(15,2) NOT NULL,
    actual_balance DECIMAL(15,2) NOT NULL,
    difference DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    reconciled_by INTEGER REFERENCES accountants(id),
    reconciled_at TIMESTAMP,
    resolution_notes TEXT,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reconciliations_date ON reconciliations(reconciliation_date);
CREATE INDEX IF NOT EXISTS idx_reconciliations_status ON reconciliations(status);
