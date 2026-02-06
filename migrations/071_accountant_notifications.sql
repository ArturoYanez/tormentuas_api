-- Notificaciones del contador
CREATE TABLE IF NOT EXISTS accountant_notifications (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    priority VARCHAR(20) DEFAULT 'normal',
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER,
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accountant_notifications_accountant ON accountant_notifications(accountant_id);
CREATE INDEX IF NOT EXISTS idx_accountant_notifications_read ON accountant_notifications(accountant_id, is_read);
