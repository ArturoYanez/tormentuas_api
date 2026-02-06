-- Respuestas rápidas predefinidas
CREATE TABLE IF NOT EXISTS canned_responses (
    id SERIAL PRIMARY KEY,
    shortcut VARCHAR(20) UNIQUE,
    title VARCHAR(100),
    content TEXT,
    category VARCHAR(50),
    language VARCHAR(5) DEFAULT 'es',
    is_global BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES support_agents(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_canned_responses_shortcut ON canned_responses(shortcut);
