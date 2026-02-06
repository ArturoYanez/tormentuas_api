-- Calificaciones de chats
CREATE TABLE IF NOT EXISTS chat_ratings (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES live_chat_sessions(id) UNIQUE,
    user_id INTEGER REFERENCES users(id),
    agent_id INTEGER REFERENCES support_agents(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_ratings_agent_id ON chat_ratings(agent_id);
