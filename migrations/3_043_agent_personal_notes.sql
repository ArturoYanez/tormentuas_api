-- Notas personales del agente
CREATE TABLE IF NOT EXISTS agent_personal_notes (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    content TEXT,
    color VARCHAR(20) DEFAULT '#3b82f6',
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_personal_notes_agent_id ON agent_personal_notes(agent_id);
