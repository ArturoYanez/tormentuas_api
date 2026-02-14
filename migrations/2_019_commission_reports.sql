-- Reportes de comisiones
CREATE TABLE IF NOT EXISTS commission_reports (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL,
    commission_type_id INTEGER REFERENCES commission_types(id),
    total_transactions INTEGER DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    total_base_amount DECIMAL(15,2) DEFAULT 0,
    average_percentage DECIMAL(5,4),
    generated_by INTEGER REFERENCES accountants(id),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_commission_reports_date ON commission_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_commission_reports_type ON commission_reports(commission_type_id);
