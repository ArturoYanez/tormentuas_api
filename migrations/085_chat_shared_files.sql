-- Archivos compartidos en chat
CREATE TABLE IF NOT EXISTS chat_shared_files (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INTEGER REFERENCES users(id),
    group_id INTEGER REFERENCES internal_chat_groups(id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    file_path VARCHAR(500) NOT NULL,
    description TEXT,
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_shared_files_sender ON chat_shared_files(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_shared_files_recipient ON chat_shared_files(recipient_id);
CREATE INDEX IF NOT EXISTS idx_chat_shared_files_group ON chat_shared_files(group_id);
