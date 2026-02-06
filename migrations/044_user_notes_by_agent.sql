-- Notas del agente sobre usuarios
CREATE TABLE IF NOT EXISTS user_notes_by_agent (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    agent_id INTEGER REFERENCES support_agents(id),
    note TEXT,
    is_important BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_notes_by_agent_user_id ON user_notes_by_agent(user_id);
CREATE INDEX idx_user_notes_by_agent_agent_id ON user_notes_by_agent(agent_id);
