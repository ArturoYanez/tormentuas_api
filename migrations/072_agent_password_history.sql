-- Historial de contraseñas del agente
CREATE TABLE IF NOT EXISTS agent_password_history (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_password_history_agent_id ON agent_password_history(agent_id);
