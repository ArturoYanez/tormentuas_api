-- Calificaciones de tickets
CREATE TABLE IF NOT EXISTS ticket_ratings (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id) UNIQUE,
    user_id INTEGER REFERENCES users(id),
    agent_id INTEGER REFERENCES support_agents(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    categories JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ticket_ratings_agent_id ON ticket_ratings(agent_id);
