-- Notificaciones del operador
CREATE TABLE IF NOT EXISTS operator_notifications (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    priority VARCHAR(20) DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_notifications_operator ON operator_notifications(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_notifications_read ON operator_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_operator_notifications_type ON operator_notifications(type);
