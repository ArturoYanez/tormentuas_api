-- Configuración de notificaciones del contador
CREATE TABLE IF NOT EXISTS accountant_notification_settings (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) ON DELETE CASCADE UNIQUE,
    email_new_withdrawal BOOLEAN DEFAULT true,
    email_large_transaction BOOLEAN DEFAULT true,
    email_daily_report BOOLEAN DEFAULT true,
    email_weekly_report BOOLEAN DEFAULT false,
    push_new_withdrawal BOOLEAN DEFAULT true,
    push_urgent BOOLEAN DEFAULT true,
    push_suspicious_alert BOOLEAN DEFAULT true,
    sound_enabled BOOLEAN DEFAULT true,
    large_transaction_threshold DECIMAL(15,2) DEFAULT 1000.00,
    urgent_withdrawal_threshold DECIMAL(15,2) DEFAULT 5000.00,
    digest_frequency VARCHAR(20) DEFAULT 'daily',
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accountant_notification_settings_accountant ON accountant_notification_settings(accountant_id);
