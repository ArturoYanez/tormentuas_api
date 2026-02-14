-- Estado de escritura en chats
CREATE TABLE IF NOT EXISTS support_chat_typing_status (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES live_chat_sessions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    agent_id INTEGER REFERENCES support_agents(id),
    is_typing BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_support_chat_typing_status_session_id ON support_chat_typing_status(session_id);
