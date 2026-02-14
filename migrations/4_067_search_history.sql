-- Historial de búsquedas del operador
CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    search_type VARCHAR(20) NOT NULL,
    search_query VARCHAR(200) NOT NULL,
    results_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_search_history_operator ON search_history(operator_id);
CREATE INDEX IF NOT EXISTS idx_search_history_type ON search_history(search_type);
