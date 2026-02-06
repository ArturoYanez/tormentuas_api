-- Sesiones activas del operador
CREATE TABLE IF NOT EXISTS operator_sessions (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    device VARCHAR(200),
    ip_address VARCHAR(45),
    location VARCHAR(100),
    token VARCHAR(500),
    is_current BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_sessions_operator_id ON operator_sessions(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_sessions_token ON operator_sessions(token);
