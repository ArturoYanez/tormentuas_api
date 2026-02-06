-- Archivos adjuntos del chat
CREATE TABLE IF NOT EXISTS team_chat_attachments (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES team_chat_messages(id) ON DELETE CASCADE,
    file_type VARCHAR(20),
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_team_chat_attachments_message ON team_chat_attachments(message_id);
