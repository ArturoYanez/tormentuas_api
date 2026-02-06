-- Registro de actividad del agente
CREATE TABLE IF NOT EXISTS agent_activity_logs (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id),
    action VARCHAR(100),
    action_category VARCHAR(20) CHECK (action_category IN ('ticket', 'chat', 'user', 'faq', 'template', 'knowledge', 'settings', 'system')),
    target_type VARCHAR(50),
    target_id INTEGER,
    target_name VARCHAR(200),
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id INTEGER REFERENCES support_agent_sessions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_activity_logs_agent_id ON agent_activity_logs(agent_id);
CREATE INDEX idx_agent_activity_logs_created_at ON agent_activity_logs(created_at);
