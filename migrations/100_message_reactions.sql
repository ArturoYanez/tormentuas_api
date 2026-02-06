-- Reacciones a mensajes de tickets/chats
CREATE TABLE IF NOT EXISTS message_reactions (
    id SERIAL PRIMARY KEY,
    message_type VARCHAR(15) CHECK (message_type IN ('ticket', 'chat', 'internal')),
    message_id INTEGER,
    agent_id INTEGER REFERENCES support_agents(id),
    emoji VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_message_reactions_message ON message_reactions(message_type, message_id);
