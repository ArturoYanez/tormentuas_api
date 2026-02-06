-- Notas internas de tickets
CREATE TABLE IF NOT EXISTS ticket_internal_notes (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES support_agents(id),
    note TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticket_internal_notes_ticket_id ON ticket_internal_notes(ticket_id);
CREATE INDEX idx_ticket_internal_notes_agent_id ON ticket_internal_notes(agent_id);
