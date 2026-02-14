-- Anuncios para el equipo de soporte
CREATE TABLE IF NOT EXISTS support_announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    content TEXT,
    type VARCHAR(15) CHECK (type IN ('info', 'warning', 'urgent', 'update')),
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')),
    target_departments JSONB,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES support_agents(id),
    starts_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_announcements_active ON support_announcements(is_active);
