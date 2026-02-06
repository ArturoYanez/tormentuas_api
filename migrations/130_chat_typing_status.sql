-- Estado de escritura en chat
CREATE TABLE IF NOT EXISTS chat_typing_status (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES team_chat_rooms(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    is_typing BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_typing_status_room ON chat_typing_status(room_id);
