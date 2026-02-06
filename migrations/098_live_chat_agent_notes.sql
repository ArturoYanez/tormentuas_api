-- Notas del agente sobre sesiones de chat
CREATE TABLE IF NOT EXISTS live_chat_agent_notes (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES live_chat_sessions(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES support_agents(id),
    note TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_live_chat_agent_notes_session_id ON live_chat_agent_notes(session_id);
