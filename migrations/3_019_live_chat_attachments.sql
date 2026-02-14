-- Archivos adjuntos del chat en vivo
CREATE TABLE IF NOT EXISTS live_chat_attachments (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES live_chat_sessions(id) ON DELETE CASCADE,
    message_id INTEGER REFERENCES live_chat_messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255),
    file_url VARCHAR(500),
    file_type VARCHAR(50),
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_live_chat_attachments_session_id ON live_chat_attachments(session_id);
