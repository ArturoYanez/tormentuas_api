-- Historial de contraseñas del operador
CREATE TABLE IF NOT EXISTS operator_password_history (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_password_history_operator ON operator_password_history(operator_id);
