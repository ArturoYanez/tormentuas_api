-- Categorías de artículos de conocimiento
CREATE TABLE IF NOT EXISTS knowledge_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    slug VARCHAR(100) UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    parent_id INTEGER REFERENCES knowledge_categories(id),
    display_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_knowledge_categories_slug ON knowledge_categories(slug);
CREATE INDEX idx_knowledge_categories_parent_id ON knowledge_categories(parent_id);
