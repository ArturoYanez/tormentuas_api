-- Menciones en el chat
CREATE TABLE IF NOT EXISTS team_chat_mentions (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES team_chat_messages(id) ON DELETE CASCADE,
    mentioned_operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_team_chat_mentions_message ON team_chat_mentions(message_id);
CREATE INDEX IF NOT EXISTS idx_team_chat_mentions_operator ON team_chat_mentions(mentioned_operator_id);
