-- Toasts del sistema
CREATE TABLE IF NOT EXISTS system_toasts (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(20) DEFAULT 'info',
    action VARCHAR(100),
    target VARCHAR(100),
    details TEXT,
    shown_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_system_toasts_operator ON system_toasts(operator_id);
