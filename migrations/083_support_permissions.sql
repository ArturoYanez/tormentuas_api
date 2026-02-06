-- Catálogo de permisos de soporte
CREATE TABLE IF NOT EXISTS support_permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE,
    code VARCHAR(50) UNIQUE,
    category VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);
