-- Miembros de salas de chat
CREATE TABLE IF NOT EXISTS internal_chat_members (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES internal_chat_rooms(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES support_agents(id),
    role VARCHAR(10) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP
);

CREATE INDEX idx_internal_chat_members_room_id ON internal_chat_members(room_id);
CREATE INDEX idx_internal_chat_members_agent_id ON internal_chat_members(agent_id);
