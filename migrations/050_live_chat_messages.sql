-- Mensajes del chat en vivo
CREATE TABLE IF NOT EXISTS live_chat_messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES live_chat_sessions(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id),
    sender_type VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    attachments JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_live_chat_messages_session_id ON live_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_live_chat_messages_sender_id ON live_chat_messages(sender_id);
