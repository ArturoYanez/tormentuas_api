-- Configuraciones del operador
CREATE TABLE IF NOT EXISTS operator_settings (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE UNIQUE,
    theme VARCHAR(10) DEFAULT 'dark',
    language VARCHAR(5) DEFAULT 'es',
    timezone VARCHAR(50),
    notifications_enabled BOOLEAN DEFAULT TRUE,
    auto_refresh BOOLEAN DEFAULT TRUE,
    sound_alerts BOOLEAN DEFAULT FALSE,
    email_alerts BOOLEAN DEFAULT TRUE,
    font_size VARCHAR(10) DEFAULT 'medium',
    density VARCHAR(10) DEFAULT 'normal',
    do_not_disturb BOOLEAN DEFAULT FALSE,
    do_not_disturb_start TIME,
    do_not_disturb_end TIME,
    session_timeout INTEGER DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_settings_operator_id ON operator_settings(operator_id);
