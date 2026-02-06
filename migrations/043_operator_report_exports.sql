-- Exportaciones de datos
CREATE TABLE IF NOT EXISTS operator_report_exports (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    export_type VARCHAR(20) NOT NULL,
    filters JSONB DEFAULT '{}',
    file_url VARCHAR(500),
    format VARCHAR(20) DEFAULT 'csv',
    row_count INTEGER,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_report_exports_operator ON operator_report_exports(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_report_exports_status ON operator_report_exports(status);
