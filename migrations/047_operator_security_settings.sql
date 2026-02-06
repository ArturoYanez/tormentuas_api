-- Configuración de seguridad del operador
CREATE TABLE IF NOT EXISTS operator_security_settings (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE UNIQUE,
    login_alerts BOOLEAN DEFAULT TRUE,
    new_device_alert BOOLEAN DEFAULT TRUE,
    failed_login_lock BOOLEAN DEFAULT TRUE,
    max_failed_attempts INTEGER DEFAULT 5,
    lock_duration_minutes INTEGER DEFAULT 30,
    require_2fa_for_sensitive BOOLEAN DEFAULT TRUE,
    ip_whitelist JSONB DEFAULT '[]',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_security_settings_operator ON operator_security_settings(operator_id);
