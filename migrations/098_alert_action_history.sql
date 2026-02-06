-- Historial de acciones de alertas
CREATE TABLE IF NOT EXISTS alert_action_history (
    id SERIAL PRIMARY KEY,
    alert_id INTEGER REFERENCES operator_alerts(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    action_data JSONB DEFAULT '{}',
    executed_by INTEGER REFERENCES operators(id),
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result VARCHAR(20) DEFAULT 'pending',
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_alert_action_history_alert ON alert_action_history(alert_id);
