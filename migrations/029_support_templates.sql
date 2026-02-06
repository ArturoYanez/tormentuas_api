-- Plantillas de respuesta
CREATE TABLE IF NOT EXISTS support_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    shortcut VARCHAR(20),
    category VARCHAR(50),
    content TEXT,
    variables JSONB DEFAULT '[]',
    language VARCHAR(5) DEFAULT 'es',
    usage_count INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_global BOOLEAN DEFAULT FALSE,
    created_by INTEGER REFERENCES support_agents(id),
    updated_by INTEGER REFERENCES support_agents(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_support_templates_category ON support_templates(category);
CREATE INDEX idx_support_templates_shortcut ON support_templates(shortcut);
