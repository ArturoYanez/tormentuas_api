-- Registro de vistas de artículos
CREATE TABLE IF NOT EXISTS knowledge_article_views (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    viewer_id INTEGER,
    viewer_type VARCHAR(10) CHECK (viewer_type IN ('agent', 'user')),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_knowledge_article_views_article_id ON knowledge_article_views(article_id);
