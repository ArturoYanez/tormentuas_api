-- Configuración de alertas por operador
CREATE TABLE IF NOT EXISTS operator_alert_settings (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    email_notification BOOLEAN DEFAULT TRUE,
    push_notification BOOLEAN DEFAULT TRUE,
    sound_notification BOOLEAN DEFAULT FALSE,
    custom_threshold DECIMAL(18,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_alert_settings_operator ON operator_alert_settings(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_alert_settings_type ON operator_alert_settings(alert_type);
