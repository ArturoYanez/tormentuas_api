-- Sesiones de chat en vivo
CREATE TABLE IF NOT EXISTS live_chat_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(50) UNIQUE,
    user_id INTEGER REFERENCES users(id),
    user_od_id VARCHAR(20),
    user_name VARCHAR(100),
    user_email VARCHAR(255),
    agent_id INTEGER REFERENCES support_agents(id),
    status VARCHAR(15) DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended', 'abandoned')),
    language VARCHAR(5) DEFAULT 'es',
    waiting_time_seconds INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    rating INTEGER,
    rating_comment TEXT,
    converted_to_ticket INTEGER REFERENCES support_tickets(id),
    source VARCHAR(10) DEFAULT 'web' CHECK (source IN ('web', 'mobile', 'widget')),
    user_agent TEXT,
    ip_address VARCHAR(45),
    started_at TIMESTAMP,
    accepted_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_live_chat_sessions_user_id ON live_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_live_chat_sessions_agent_id ON live_chat_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_live_chat_sessions_status ON live_chat_sessions(status);
