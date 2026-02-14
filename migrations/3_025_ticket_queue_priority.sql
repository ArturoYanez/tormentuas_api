-- Priorización de cola de tickets
CREATE TABLE IF NOT EXISTS ticket_queue_priority (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id) UNIQUE,
    sla_status VARCHAR(15) CHECK (sla_status IN ('ok', 'warning', 'critical', 'breached')),
    sla_minutes_remaining INTEGER,
    priority_score INTEGER,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ticket_queue_priority_sla_status ON ticket_queue_priority(sla_status);
