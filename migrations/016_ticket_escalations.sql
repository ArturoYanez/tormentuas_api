-- Historial de escalaciones de tickets
CREATE TABLE IF NOT EXISTS ticket_escalations (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
    escalated_by INTEGER REFERENCES support_agents(id),
    escalated_to VARCHAR(50),
    escalated_to_id INTEGER,
    reason TEXT,
    priority_before VARCHAR(20),
    priority_after VARCHAR(20),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticket_escalations_ticket_id ON ticket_escalations(ticket_id);
