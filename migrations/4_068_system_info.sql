-- Información del sistema
CREATE TABLE IF NOT EXISTS system_info (
    id SERIAL PRIMARY KEY,
    version VARCHAR(20) NOT NULL,
    last_update TIMESTAMP,
    server_name VARCHAR(50),
    server_region VARCHAR(50),
    is_maintenance BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
