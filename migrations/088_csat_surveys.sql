-- Encuestas de satisfacción
CREATE TABLE IF NOT EXISTS csat_surveys (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id),
    chat_session_id INTEGER REFERENCES live_chat_sessions(id),
    user_id INTEGER REFERENCES users(id),
    agent_id INTEGER REFERENCES support_agents(id),
    overall_rating INTEGER,
    response_time_rating INTEGER,
    resolution_rating INTEGER,
    professionalism_rating INTEGER,
    would_recommend BOOLEAN,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_csat_surveys_agent_id ON csat_surveys(agent_id);
