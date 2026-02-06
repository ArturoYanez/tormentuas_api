-- Respuestas rápidas para chat en vivo
CREATE TABLE IF NOT EXISTS chat_quick_replies (
    id SERIAL PRIMARY KEY,
    text TEXT,
    category VARCHAR(50),
    language VARCHAR(5) DEFAULT 'es',
    display_order INTEGER,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES support_agents(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_quick_replies_category ON chat_quick_replies(category);
