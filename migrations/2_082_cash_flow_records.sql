-- Registros de flujo de caja
CREATE TABLE IF NOT EXISTS cash_flow_records (
    id SERIAL PRIMARY KEY,
    record_date DATE NOT NULL,
    record_type VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    inflow DECIMAL(15,2) DEFAULT 0,
    outflow DECIMAL(15,2) DEFAULT 0,
    net_flow DECIMAL(15,2) DEFAULT 0,
    running_balance DECIMAL(15,2),
    reference_type VARCHAR(50),
    reference_id INTEGER,
    recorded_by INTEGER REFERENCES accountants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cash_flow_records_date ON cash_flow_records(record_date);
CREATE INDEX IF NOT EXISTS idx_cash_flow_records_type ON cash_flow_records(record_type);
