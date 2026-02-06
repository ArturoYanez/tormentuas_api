-- Reportes generados por operadores
CREATE TABLE IF NOT EXISTS operator_reports (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    report_type VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    data JSONB DEFAULT '{}',
    filters JSONB DEFAULT '{}',
    file_url VARCHAR(500),
    format VARCHAR(20) DEFAULT 'pdf',
    status VARCHAR(20) DEFAULT 'generating',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_reports_operator ON operator_reports(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_reports_type ON operator_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_operator_reports_status ON operator_reports(status);
