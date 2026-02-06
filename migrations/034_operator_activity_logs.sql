-- Registro de actividad del operador
CREATE TABLE IF NOT EXISTS operator_activity_logs (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    action_category VARCHAR(50),
    target_type VARCHAR(50),
    target_id INTEGER,
    target_name VARCHAR(200),
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id INTEGER REFERENCES operator_sessions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_activity_logs_operator ON operator_activity_logs(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_activity_logs_action ON operator_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_operator_activity_logs_date ON operator_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_operator_activity_logs_target ON operator_activity_logs(target_type, target_id);
