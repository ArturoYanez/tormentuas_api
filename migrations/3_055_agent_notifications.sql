-- Notificaciones del agente
CREATE TABLE IF NOT EXISTS agent_notifications (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('ticket', 'chat', 'sla', 'escalation', 'system', 'rating', 'mention')),
    title VARCHAR(200),
    message TEXT,
    data JSONB,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_notifications_agent_id ON agent_notifications(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_notifications_is_read ON agent_notifications(is_read);
