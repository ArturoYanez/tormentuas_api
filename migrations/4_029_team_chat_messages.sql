-- Mensajes del chat interno
CREATE TABLE IF NOT EXISTS team_chat_messages (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES team_chat_rooms(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES operators(id),
    sender_role VARCHAR(20),
    message TEXT NOT NULL,
    reply_to INTEGER REFERENCES team_chat_messages(id),
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_team_chat_messages_room ON team_chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_team_chat_messages_sender ON team_chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_team_chat_messages_date ON team_chat_messages(created_at);
