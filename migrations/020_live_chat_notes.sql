-- Notas del agente sobre el chat
CREATE TABLE IF NOT EXISTS live_chat_notes (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES live_chat_sessions(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES support_agents(id),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_live_chat_notes_session_id ON live_chat_notes(session_id);
