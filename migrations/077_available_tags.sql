-- Tags disponibles para tickets
CREATE TABLE IF NOT EXISTS available_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE,
    color VARCHAR(20),
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES support_agents(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_available_tags_name ON available_tags(name);
