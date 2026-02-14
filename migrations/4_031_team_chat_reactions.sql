-- Reacciones a mensajes
CREATE TABLE IF NOT EXISTS team_chat_reactions (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES team_chat_messages(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_team_chat_reactions_message ON team_chat_reactions(message_id);
