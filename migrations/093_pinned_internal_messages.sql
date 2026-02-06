-- Mensajes anclados del chat interno
CREATE TABLE IF NOT EXISTS pinned_internal_messages (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES internal_chat_messages(id) ON DELETE CASCADE,
    room_id INTEGER REFERENCES internal_chat_rooms(id),
    pinned_by INTEGER REFERENCES support_agents(id),
    pinned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pinned_internal_messages_room_id ON pinned_internal_messages(room_id);
