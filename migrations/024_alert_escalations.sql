-- Escalaciones de alertas
CREATE TABLE IF NOT EXISTS alert_escalations (
    id SERIAL PRIMARY KEY,
    alert_id INTEGER REFERENCES operator_alerts(id) ON DELETE CASCADE,
    escalated_from INTEGER REFERENCES operators(id),
    escalated_to INTEGER REFERENCES operators(id),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alert_escalations_alert ON alert_escalations(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_escalations_to ON alert_escalations(escalated_to);
