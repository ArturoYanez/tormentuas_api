-- Solicitudes de cambio de contraseña
CREATE TABLE IF NOT EXISTS password_change_requests (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    ip_address VARCHAR(45),
    status VARCHAR(20) DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS idx_password_change_requests_operator ON password_change_requests(operator_id);
