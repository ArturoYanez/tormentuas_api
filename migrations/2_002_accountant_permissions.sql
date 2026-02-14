-- Permisos de contadores
CREATE TABLE IF NOT EXISTS accountant_permissions (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) ON DELETE CASCADE,
    permission_type VARCHAR(50) NOT NULL,
    can_view BOOLEAN DEFAULT true,
    can_create BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_approve BOOLEAN DEFAULT false,
    max_amount DECIMAL(15,2),
    granted_by INTEGER REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accountant_permissions_accountant ON accountant_permissions(accountant_id);
CREATE INDEX IF NOT EXISTS idx_accountant_permissions_type ON accountant_permissions(permission_type);
