-- Reportes programados
CREATE TABLE IF NOT EXISTS operator_scheduled_reports (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL,
    schedule VARCHAR(20) NOT NULL,
    day_of_week INTEGER,
    day_of_month INTEGER,
    time TIME,
    recipients JSONB DEFAULT '[]',
    filters JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_scheduled_reports_operator ON operator_scheduled_reports(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_scheduled_reports_active ON operator_scheduled_reports(is_active);
