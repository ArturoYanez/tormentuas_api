-- Registro de acceso a datos sensibles
CREATE TABLE IF NOT EXISTS data_access_logs (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    data_type VARCHAR(50) NOT NULL,
    data_id INTEGER,
    access_type VARCHAR(20) NOT NULL,
    fields_accessed JSONB DEFAULT '[]',
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_data_access_logs_operator ON data_access_logs(operator_id);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_type ON data_access_logs(data_type);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_date ON data_access_logs(created_at);
