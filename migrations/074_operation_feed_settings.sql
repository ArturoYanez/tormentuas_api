-- Configuración del feed de operaciones
CREATE TABLE IF NOT EXISTS operation_feed_settings (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE UNIQUE,
    auto_refresh BOOLEAN DEFAULT TRUE,
    refresh_interval INTEGER DEFAULT 5,
    show_flagged_only BOOLEAN DEFAULT FALSE,
    show_pending_only BOOLEAN DEFAULT FALSE,
    sound_on_flag BOOLEAN DEFAULT TRUE,
    max_items INTEGER DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operation_feed_settings_operator ON operation_feed_settings(operator_id);
