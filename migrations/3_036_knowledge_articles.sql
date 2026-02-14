-- Artículos de la base de conocimiento
CREATE TABLE IF NOT EXISTS knowledge_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    slug VARCHAR(200) UNIQUE,
    content TEXT,
    excerpt TEXT,
    category_id INTEGER REFERENCES knowledge_categories(id),
    author_id INTEGER REFERENCES support_agents(id),
    views_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    is_internal BOOLEAN DEFAULT TRUE,
    language VARCHAR(5) DEFAULT 'es',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'knowledge_articles' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE knowledge_articles ADD COLUMN category_id INTEGER REFERENCES knowledge_categories(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'knowledge_articles' AND column_name = 'author_id'
    ) THEN
        ALTER TABLE knowledge_articles ADD COLUMN author_id INTEGER REFERENCES support_agents(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_knowledge_articles_category_id ON knowledge_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_is_published ON knowledge_articles(is_published);
