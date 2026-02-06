-- Incumplimientos de SLA
CREATE TABLE IF NOT EXISTS sla_breaches (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
    policy_id INTEGER REFERENCES sla_policies(id),
    breach_type VARCHAR(20) CHECK (breach_type IN ('first_response', 'resolution')),
    expected_at TIMESTAMP,
    breached_at TIMESTAMP,
    time_exceeded_minutes INTEGER,
    agent_id INTEGER REFERENCES support_agents(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sla_breaches_ticket_id ON sla_breaches(ticket_id);
