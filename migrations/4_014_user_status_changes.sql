-- Cambios de estado de usuarios
CREATE TABLE IF NOT EXISTS user_status_changes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id),
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    reason TEXT,
    duration_hours INTEGER,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_status_changes_user ON user_status_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_status_changes_operator ON user_status_changes(operator_id);
