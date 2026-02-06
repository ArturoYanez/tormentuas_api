-- Historial de cambios de perfil del operador
CREATE TABLE IF NOT EXISTS operator_profile_changes (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    field_changed VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by INTEGER REFERENCES operators(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45)
);

CREATE INDEX IF NOT EXISTS idx_operator_profile_changes_operator ON operator_profile_changes(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_profile_changes_date ON operator_profile_changes(changed_at);
