-- Artículos relacionados
CREATE TABLE IF NOT EXISTS knowledge_related_articles (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    related_article_id INTEGER REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_knowledge_related_articles_article_id ON knowledge_related_articles(article_id);
