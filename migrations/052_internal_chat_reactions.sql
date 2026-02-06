-- Reacciones a mensajes internos
CREATE TABLE IF NOT EXISTS internal_chat_reactions (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES internal_chat_messages(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES support_agents(id),
    emoji VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_internal_chat_reactions_message_id ON internal_chat_reactions(message_id);
