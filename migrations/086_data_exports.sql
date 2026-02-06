-- Exportaciones de datos solicitadas
CREATE TABLE IF NOT EXISTS data_exports (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id),
    export_type VARCHAR(20) CHECK (export_type IN ('tickets', 'users', 'chats', 'reports', 'all')),
    filters JSONB,
    format VARCHAR(10) CHECK (format IN ('csv', 'excel', 'json', 'pdf')),
    file_url VARCHAR(500),
    file_size INTEGER,
    row_count INTEGER,
    status VARCHAR(15) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX idx_data_exports_agent_id ON data_exports(agent_id);
