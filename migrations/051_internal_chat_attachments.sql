-- Archivos adjuntos del chat interno
CREATE TABLE IF NOT EXISTS internal_chat_attachments (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES internal_chat_messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255),
    file_url VARCHAR(500),
    file_type VARCHAR(50),
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_internal_chat_attachments_message_id ON internal_chat_attachments(message_id);
