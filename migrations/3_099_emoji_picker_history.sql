-- Historial de emojis usados por el agente
CREATE TABLE IF NOT EXISTS emoji_picker_history (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    emoji VARCHAR(10),
    usage_count INTEGER DEFAULT 1,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_emoji_picker_history_agent_id ON emoji_picker_history(agent_id);
