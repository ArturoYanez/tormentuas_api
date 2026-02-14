-- Vistas favoritas del operador
CREATE TABLE IF NOT EXISTS operator_favorite_views (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    view VARCHAR(50) NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_favorite_views_operator ON operator_favorite_views(operator_id);
