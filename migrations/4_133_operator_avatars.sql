-- Avatares de operadores
CREATE TABLE IF NOT EXISTS operator_avatars (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    avatar_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    is_current BOOLEAN DEFAULT TRUE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_avatars_operator ON operator_avatars(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_avatars_current ON operator_avatars(is_current);
