-- Importaciones de datos realizadas
CREATE TABLE IF NOT EXISTS data_imports (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id),
    import_type VARCHAR(30) CHECK (import_type IN ('templates', 'faqs', 'knowledge', 'canned_responses')),
    file_name VARCHAR(255),
    file_url VARCHAR(500),
    records_total INTEGER,
    records_imported INTEGER,
    records_failed INTEGER,
    errors JSONB,
    status VARCHAR(15) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_data_imports_agent_id ON data_imports(agent_id);
