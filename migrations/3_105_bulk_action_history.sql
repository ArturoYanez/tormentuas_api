-- Historial de acciones en lote
CREATE TABLE IF NOT EXISTS bulk_action_history (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id),
    action_type VARCHAR(20) CHECK (action_type IN ('assign', 'escalate', 'close', 'tag', 'priority', 'transfer')),
    ticket_ids JSONB,
    ticket_count INTEGER,
    action_details JSONB,
    status VARCHAR(15) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'partial', 'failed')),
    success_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bulk_action_history_agent_id ON bulk_action_history(agent_id);
