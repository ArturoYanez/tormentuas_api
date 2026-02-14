-- Historial de inicios de sesión
CREATE TABLE IF NOT EXISTS agent_login_history (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    device VARCHAR(200),
    location VARCHAR(100),
    status VARCHAR(15) CHECK (status IN ('success', 'failed', 'blocked')),
    failure_reason VARCHAR(100),
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_login_history_agent_id ON agent_login_history(agent_id);
