-- Permisos específicos del operador
CREATE TABLE IF NOT EXISTS operator_permissions (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    granted_by INTEGER REFERENCES operators(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_permissions_operator_id ON operator_permissions(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_permissions_permission_id ON operator_permissions(permission_id);
