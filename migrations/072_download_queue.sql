-- Cola de descargas
CREATE TABLE IF NOT EXISTS download_queue (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    export_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255),
    file_url VARCHAR(500),
    file_size INTEGER,
    status VARCHAR(20) DEFAULT 'queued',
    progress INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_download_queue_operator ON download_queue(operator_id);
CREATE INDEX IF NOT EXISTS idx_download_queue_status ON download_queue(status);
