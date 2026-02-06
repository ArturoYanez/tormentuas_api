-- Índice de búsqueda global
CREATE TABLE IF NOT EXISTS search_index (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(20) CHECK (entity_type IN ('ticket', 'user', 'faq', 'article', 'template')),
    entity_id INTEGER,
    title VARCHAR(500),
    content TEXT,
    metadata JSONB,
    search_vector TSVECTOR,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_index_entity ON search_index(entity_type, entity_id);
CREATE INDEX idx_search_vector ON search_index USING GIN(search_vector);
