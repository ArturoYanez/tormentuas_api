-- Sobrescrituras de nivel de usuario
CREATE TABLE IF NOT EXISTS user_level_overrides (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id),
    previous_level VARCHAR(20),
    new_level VARCHAR(20) NOT NULL,
    reason TEXT,
    is_permanent BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_level_overrides_user ON user_level_overrides(user_id);
