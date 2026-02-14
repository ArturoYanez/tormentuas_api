-- Historial de transferencias de tickets
CREATE TABLE IF NOT EXISTS ticket_transfers (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
    from_agent_id INTEGER REFERENCES support_agents(id),
    to_agent_id INTEGER REFERENCES support_agents(id),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ticket_transfers_ticket_id ON ticket_transfers(ticket_id);
