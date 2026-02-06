-- Menciones en el chat interno
CREATE TABLE IF NOT EXISTS internal_chat_mentions (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES internal_chat_messages(id) ON DELETE CASCADE,
    mentioned_agent_id INTEGER REFERENCES support_agents(id),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_internal_chat_mentions_message_id ON internal_chat_mentions(message_id);
CREATE INDEX idx_internal_chat_mentions_mentioned ON internal_chat_mentions(mentioned_agent_id);
