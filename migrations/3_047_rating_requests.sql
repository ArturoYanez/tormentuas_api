-- Solicitudes de calificación enviadas
CREATE TABLE IF NOT EXISTS rating_requests (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id),
    chat_session_id INTEGER REFERENCES live_chat_sessions(id),
    user_id INTEGER REFERENCES users(id),
    agent_id INTEGER REFERENCES support_agents(id),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    is_responded BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_rating_requests_agent_id ON rating_requests(agent_id);
