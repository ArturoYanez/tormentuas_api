-- Reportes programados
CREATE TABLE IF NOT EXISTS scheduled_reports (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id),
    report_type VARCHAR(50),
    schedule VARCHAR(10) CHECK (schedule IN ('daily', 'weekly', 'monthly')),
    day_of_week INTEGER,
    day_of_month INTEGER,
    time TIME,
    recipients JSONB,
    filters JSONB,
    format VARCHAR(10) CHECK (format IN ('pdf', 'csv', 'excel')),
    is_active BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_run ON scheduled_reports(next_run_at);
