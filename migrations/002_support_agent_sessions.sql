-- Sesiones activas del agente
CREATE TABLE IF NOT EXISTS support_agent_sessions (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    device VARCHAR(200),
    ip_address VARCHAR(45),
    location VARCHAR(100),
    token VARCHAR(500),
    is_current BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX idx_support_agent_sessions_agent_id ON support_agent_sessions(agent_id);
CREATE INDEX idx_support_agent_sessions_token ON support_agent_sessions(token);
