-- Reportes personalizados
CREATE TABLE IF NOT EXISTS custom_reports (
    id SERIAL PRIMARY KEY,
    report_name VARCHAR(200) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    date_range_start DATE,
    date_range_end DATE,
    filters JSONB DEFAULT '{}',
    include_deposits BOOLEAN DEFAULT true,
    include_withdrawals BOOLEAN DEFAULT true,
    include_prizes BOOLEAN DEFAULT false,
    include_invoices BOOLEAN DEFAULT false,
    include_reconciliations BOOLEAN DEFAULT false,
    output_format VARCHAR(20) DEFAULT 'csv',
    generated_by INTEGER REFERENCES accountants(id),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(500),
    file_size INTEGER,
    download_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_custom_reports_type ON custom_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_custom_reports_date ON custom_reports(generated_at);
