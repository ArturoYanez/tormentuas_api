-- Mensajes del chat interno
CREATE TABLE IF NOT EXISTS internal_chat_messages (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES internal_chat_rooms(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES support_agents(id),
    sender_role VARCHAR(15) CHECK (sender_role IN ('support', 'operator', 'admin')),
    message TEXT,
    reply_to INTEGER REFERENCES internal_chat_messages(id),
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP
);

CREATE INDEX idx_internal_chat_messages_room_id ON internal_chat_messages(room_id);
CREATE INDEX idx_internal_chat_messages_sender_id ON internal_chat_messages(sender_id);
