-- Configuración de notificaciones
CREATE TABLE IF NOT EXISTS notification_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    trades_enabled BOOLEAN DEFAULT TRUE,
    deposits_enabled BOOLEAN DEFAULT TRUE,
    withdrawals_enabled BOOLEAN DEFAULT TRUE,
    promotions_enabled BOOLEAN DEFAULT FALSE,
    news_enabled BOOLEAN DEFAULT FALSE,
    price_alerts_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);
