-- Filtros de cola guardados
CREATE TABLE IF NOT EXISTS saved_queue_filters (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    name VARCHAR(100),
    filters JSONB,
    sort_by VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saved_queue_filters_agent_id ON saved_queue_filters(agent_id);
