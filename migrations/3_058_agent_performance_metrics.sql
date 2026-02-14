-- Métricas de rendimiento del agente
CREATE TABLE IF NOT EXISTS agent_performance_metrics (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    period VARCHAR(10) CHECK (period IN ('daily', 'weekly', 'monthly')),
    period_start DATE,
    period_end DATE,
    total_tickets INTEGER DEFAULT 0,
    resolved_tickets INTEGER DEFAULT 0,
    escalated_tickets INTEGER DEFAULT 0,
    total_chats INTEGER DEFAULT 0,
    avg_first_response_minutes DECIMAL(10,2),
    avg_resolution_minutes DECIMAL(10,2),
    sla_compliance_percentage DECIMAL(5,2),
    satisfaction_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_performance_metrics_agent_id ON agent_performance_metrics(agent_id);
