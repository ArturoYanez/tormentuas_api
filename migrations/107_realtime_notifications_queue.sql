-- Cola de notificaciones en tiempo real
CREATE TABLE IF NOT EXISTS realtime_notifications_queue (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    notification_type VARCHAR(50),
    title VARCHAR(200),
    message TEXT,
    data JSONB,
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_delivered BOOLEAN DEFAULT FALSE,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX idx_realtime_queue_agent ON realtime_notifications_queue(agent_id, is_delivered);
