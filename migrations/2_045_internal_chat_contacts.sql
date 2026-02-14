-- Contactos de chat interno
CREATE TABLE IF NOT EXISTS internal_chat_contacts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    contact_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    contact_role VARCHAR(50),
    is_favorite BOOLEAN DEFAULT false,
    last_message_at TIMESTAMP,
    unread_count INTEGER DEFAULT 0,
    is_muted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_internal_chat_contacts_user ON internal_chat_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_internal_chat_contacts_contact ON internal_chat_contacts(contact_id);
