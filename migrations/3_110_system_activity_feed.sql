-- Feed de actividad del sistema
CREATE TABLE IF NOT EXISTS system_activity_feed (
    id SERIAL PRIMARY KEY,
    activity_type VARCHAR(50),
    icon VARCHAR(50),
    color VARCHAR(20),
    title VARCHAR(200),
    description TEXT,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    agent_id INTEGER REFERENCES support_agents(id),
    is_global BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_system_activity_feed_created_at ON system_activity_feed(created_at);
CREATE INDEX IF NOT EXISTS idx_system_activity_feed_type ON system_activity_feed(activity_type);
