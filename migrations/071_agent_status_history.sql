-- Historial de cambios de estado
CREATE TABLE IF NOT EXISTS agent_status_history (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    status_message VARCHAR(200),
    duration_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_status_history_agent_id ON agent_status_history(agent_id);
