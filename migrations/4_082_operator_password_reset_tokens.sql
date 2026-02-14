-- Tokens de reset de contraseña
CREATE TABLE IF NOT EXISTS operator_password_reset_tokens (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_password_reset_tokens_operator ON operator_password_reset_tokens(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_password_reset_tokens_token ON operator_password_reset_tokens(token);
