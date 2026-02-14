-- Tags de artículos
CREATE TABLE IF NOT EXISTS knowledge_article_tags (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    tag VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_knowledge_article_tags_article_id ON knowledge_article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_article_tags_tag ON knowledge_article_tags(tag);
