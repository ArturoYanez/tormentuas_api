-- Notificaciones silenciadas
CREATE TABLE IF NOT EXISTS muted_notifications (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL,
    muted_until TIMESTAMP,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(accountant_id, notification_type)
);

CREATE INDEX IF NOT EXISTS idx_muted_notifications_accountant ON muted_notifications(accountant_id);
CREATE INDEX IF NOT EXISTS idx_muted_notifications_type ON muted_notifications(notification_type);
