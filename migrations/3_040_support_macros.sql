-- Macros de acciones automatizadas
CREATE TABLE IF NOT EXISTS support_macros (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    is_global BOOLEAN DEFAULT FALSE,
    created_by INTEGER REFERENCES support_agents(id),
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_macros_created_by ON support_macros(created_by);
