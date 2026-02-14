-- Archivos subidos en chat
CREATE TABLE IF NOT EXISTS chat_file_uploads (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES team_chat_messages(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id),
    file_type VARCHAR(20),
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    thumbnail_url VARCHAR(500),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_file_uploads_message ON chat_file_uploads(message_id);
