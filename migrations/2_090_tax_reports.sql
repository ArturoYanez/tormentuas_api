-- Reportes de impuestos
CREATE TABLE IF NOT EXISTS tax_reports (
    id SERIAL PRIMARY KEY,
    report_period VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER,
    quarter INTEGER,
    total_gross DECIMAL(15,2) DEFAULT 0,
    total_tax_withheld DECIMAL(15,2) DEFAULT 0,
    total_net DECIMAL(15,2) DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',
    submitted_at TIMESTAMP,
    submitted_by INTEGER REFERENCES accountants(id),
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tax_reports_year ON tax_reports(year);
CREATE INDEX IF NOT EXISTS idx_tax_reports_status ON tax_reports(status);
