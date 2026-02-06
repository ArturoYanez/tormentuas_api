-- Reportes generados
CREATE TABLE IF NOT EXISTS support_reports (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id),
    report_type VARCHAR(20) CHECK (report_type IN ('overview', 'tickets', 'agents', 'satisfaction', 'sla', 'custom')),
    title VARCHAR(200),
    period VARCHAR(15) CHECK (period IN ('today', 'week', 'month', 'quarter', 'custom')),
    date_from DATE,
    date_to DATE,
    filters JSONB,
    data JSONB,
    file_url VARCHAR(500),
    format VARCHAR(10) CHECK (format IN ('pdf', 'csv', 'excel')),
    status VARCHAR(15) DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_support_reports_agent_id ON support_reports(agent_id);
CREATE INDEX idx_support_reports_type ON support_reports(report_type);
