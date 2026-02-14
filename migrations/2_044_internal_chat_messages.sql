-- Mensajes de chat interno
CREATE TABLE IF NOT EXISTS accountant_chat_messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    sender_role VARCHAR(50) NOT NULL,
    recipient_id INTEGER REFERENCES users(id),
    recipient_role VARCHAR(50),
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    attachment_url VARCHAR(500),
    attachment_type VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    is_urgent BOOLEAN DEFAULT false,
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accountant_chat_messages_sender ON accountant_chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_accountant_chat_messages_recipient ON accountant_chat_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_accountant_chat_messages_read ON accountant_chat_messages(is_read);
