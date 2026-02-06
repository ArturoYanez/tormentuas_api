-- Respuestas rápidas favoritas del agente
CREATE TABLE IF NOT EXISTS agent_quick_reply_favorites (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    quick_reply_id INTEGER REFERENCES chat_quick_replies(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_quick_reply_favorites_agent_id ON agent_quick_reply_favorites(agent_id);
