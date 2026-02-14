-- Configuración 2FA del operador
CREATE TABLE IF NOT EXISTS operator_two_factor (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE UNIQUE,
    is_enabled BOOLEAN DEFAULT FALSE,
    secret VARCHAR(100),
    backup_codes JSONB DEFAULT '[]',
    last_used_at TIMESTAMP,
    enabled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_two_factor_operator ON operator_two_factor(operator_id);
