-- Estado del servidor en tiempo real
CREATE TABLE IF NOT EXISTS server_status (
    id SERIAL PRIMARY KEY,
    server_name VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'online',
    latency_ms INTEGER,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    active_connections INTEGER,
    last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_server_status_name ON server_status(server_name);
CREATE INDEX IF NOT EXISTS idx_server_status_status ON server_status(status);
