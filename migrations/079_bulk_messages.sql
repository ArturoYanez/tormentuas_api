-- Mensajes masivos
CREATE TABLE IF NOT EXISTS bulk_messages (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    target_criteria JSONB DEFAULT '{}',
    recipients_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bulk_messages_operator ON bulk_messages(operator_id);
CREATE INDEX IF NOT EXISTS idx_bulk_messages_status ON bulk_messages(status);
