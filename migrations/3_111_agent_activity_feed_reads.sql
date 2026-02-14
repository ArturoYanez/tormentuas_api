-- Lecturas del feed de actividad
CREATE TABLE IF NOT EXISTS agent_activity_feed_reads (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    last_read_activity_id INTEGER REFERENCES system_activity_feed(id),
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_activity_feed_reads_agent_id ON agent_activity_feed_reads(agent_id);
