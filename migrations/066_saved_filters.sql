-- Filtros guardados por operador
CREATE TABLE IF NOT EXISTS saved_filters (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    filter_name VARCHAR(100) NOT NULL,
    filter_type VARCHAR(20) NOT NULL,
    filter_config JSONB NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saved_filters_operator ON saved_filters(operator_id);
CREATE INDEX IF NOT EXISTS idx_saved_filters_type ON saved_filters(filter_type);
