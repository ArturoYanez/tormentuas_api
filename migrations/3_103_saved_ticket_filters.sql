-- Filtros de tickets guardados por el agente
CREATE TABLE IF NOT EXISTS saved_ticket_filters (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    name VARCHAR(100),
    filters JSONB,
    is_default BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saved_ticket_filters_agent_id ON saved_ticket_filters(agent_id);
