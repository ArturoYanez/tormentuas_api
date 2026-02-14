-- Sugerencias de respuesta por IA
CREATE TABLE IF NOT EXISTS ai_response_suggestions (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id),
    message_id INTEGER REFERENCES ticket_messages(id),
    suggested_response TEXT,
    confidence DECIMAL(5,4),
    was_used BOOLEAN DEFAULT FALSE,
    was_modified BOOLEAN DEFAULT FALSE,
    agent_id INTEGER REFERENCES support_agents(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_response_suggestions_ticket_id ON ai_response_suggestions(ticket_id);
