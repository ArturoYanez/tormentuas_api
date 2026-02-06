-- Configuración de auto-refresh
CREATE TABLE IF NOT EXISTS auto_refresh_config (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE UNIQUE,
    is_enabled BOOLEAN DEFAULT TRUE,
    interval_seconds INTEGER DEFAULT 5,
    refresh_operations BOOLEAN DEFAULT TRUE,
    refresh_alerts BOOLEAN DEFAULT TRUE,
    refresh_users BOOLEAN DEFAULT FALSE,
    refresh_stats BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auto_refresh_config_operator ON auto_refresh_config(operator_id);
