-- Calificaciones del soporte
CREATE TABLE IF NOT EXISTS support_ratings (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_ratings_ticket_id ON support_ratings(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ratings_agent_id ON support_ratings(agent_id);
