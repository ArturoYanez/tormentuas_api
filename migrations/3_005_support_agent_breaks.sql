-- Pausas programadas del agente
CREATE TABLE IF NOT EXISTS support_agent_breaks (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    name VARCHAR(100),
    start_time TIME,
    end_time TIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_agent_breaks_agent_id ON support_agent_breaks(agent_id);
