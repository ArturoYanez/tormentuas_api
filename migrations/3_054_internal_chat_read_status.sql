-- Estado de lectura del chat interno
CREATE TABLE IF NOT EXISTS internal_chat_read_status (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES internal_chat_rooms(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES support_agents(id),
    last_read_message_id INTEGER REFERENCES internal_chat_messages(id),
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_internal_chat_read_status_room_agent ON internal_chat_read_status(room_id, agent_id);
