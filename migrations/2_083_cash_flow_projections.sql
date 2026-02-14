-- Proyecciones de flujo de caja
CREATE TABLE IF NOT EXISTS cash_flow_projections (
    id SERIAL PRIMARY KEY,
    projection_date DATE NOT NULL UNIQUE,
    projected_inflow DECIMAL(15,2) DEFAULT 0,
    projected_outflow DECIMAL(15,2) DEFAULT 0,
    projected_balance DECIMAL(15,2),
    actual_inflow DECIMAL(15,2),
    actual_outflow DECIMAL(15,2),
    actual_balance DECIMAL(15,2),
    variance DECIMAL(15,2),
    notes TEXT,
    created_by INTEGER REFERENCES accountants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cash_flow_projections_date ON cash_flow_projections(projection_date);
