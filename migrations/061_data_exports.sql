-- Exportaciones de datos
CREATE TABLE IF NOT EXISTS data_exports (
    id SERIAL PRIMARY KEY,
    export_type VARCHAR(100) NOT NULL,
    export_format VARCHAR(20) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_size INTEGER,
    filters JSONB DEFAULT '{}',
    date_range_start DATE,
    date_range_end DATE,
    record_count INTEGER,
    exported_by INTEGER REFERENCES accountants(id),
    exported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_data_exports_type ON data_exports(export_type);
CREATE INDEX IF NOT EXISTS idx_data_exports_date ON data_exports(exported_at);
