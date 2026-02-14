-- Estado de lectura de mensajes
CREATE TABLE IF NOT EXISTS team_chat_read_status (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES team_chat_rooms(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    last_read_message_id INTEGER REFERENCES team_chat_messages(id),
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_team_chat_read_status_room ON team_chat_read_status(room_id);
CREATE INDEX IF NOT EXISTS idx_team_chat_read_status_operator ON team_chat_read_status(operator_id);
