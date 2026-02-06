-- Usuarios bajo monitoreo especial
CREATE TABLE IF NOT EXISTS monitored_users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id),
    reason TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    monitoring_type VARCHAR(20) DEFAULT 'all_activity',
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_monitored_users_user ON monitored_users(user_id);
CREATE INDEX IF NOT EXISTS idx_monitored_users_operator ON monitored_users(operator_id);
CREATE INDEX IF NOT EXISTS idx_monitored_users_active ON monitored_users(is_active);
