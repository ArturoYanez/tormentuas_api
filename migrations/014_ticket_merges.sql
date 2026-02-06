-- Historial de fusiones de tickets
CREATE TABLE IF NOT EXISTS ticket_merges (
    id SERIAL PRIMARY KEY,
    source_ticket_id INTEGER,
    target_ticket_id INTEGER REFERENCES support_tickets(id),
    merged_by INTEGER REFERENCES support_agents(id),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticket_merges_target ON ticket_merges(target_ticket_id);
