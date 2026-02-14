-- Transferencias de chat entre agentes
CREATE TABLE IF NOT EXISTS live_chat_transfers (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES live_chat_sessions(id) ON DELETE CASCADE,
    from_agent_id INTEGER REFERENCES support_agents(id),
    to_agent_id INTEGER REFERENCES support_agents(id),
    reason TEXT,
    accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_live_chat_transfers_session_id ON live_chat_transfers(session_id);
