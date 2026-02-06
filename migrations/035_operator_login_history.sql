-- Historial de inicios de sesión
CREATE TABLE IF NOT EXISTS operator_login_history (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    device VARCHAR(200),
    location VARCHAR(100),
    status VARCHAR(20) NOT NULL,
    failure_reason VARCHAR(100),
    two_factor_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_login_history_operator ON operator_login_history(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_login_history_date ON operator_login_history(created_at);
