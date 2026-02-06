-- Sesiones de chat en vivo
CREATE TABLE IF NOT EXISTS live_chat_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'waiting',
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    rating INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_live_chat_sessions_user_id ON live_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_live_chat_sessions_agent_id ON live_chat_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_live_chat_sessions_status ON live_chat_sessions(status);
