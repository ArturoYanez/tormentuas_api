-- Anuncios del sistema para operadores
CREATE TABLE IF NOT EXISTS system_announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info',
    target_roles JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMP,
    ends_at TIMESTAMP,
    created_by INTEGER REFERENCES operators(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_system_announcements_active ON system_announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_system_announcements_type ON system_announcements(type);
