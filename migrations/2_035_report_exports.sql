-- Exportaciones de reportes
CREATE TABLE IF NOT EXISTS report_exports (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES financial_reports(id) ON DELETE CASCADE,
    export_type VARCHAR(20) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_size INTEGER,
    exported_by INTEGER REFERENCES accountants(id),
    exported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_report_exports_report ON report_exports(report_id);
