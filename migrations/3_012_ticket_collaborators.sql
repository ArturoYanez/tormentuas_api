-- Colaboradores en tickets
CREATE TABLE IF NOT EXISTS ticket_collaborators (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES support_agents(id),
    added_by INTEGER REFERENCES support_agents(id),
    role VARCHAR(15) DEFAULT 'contributor' CHECK (role IN ('viewer', 'contributor')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ticket_collaborators_ticket_id ON ticket_collaborators(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_collaborators_agent_id ON ticket_collaborators(agent_id);
