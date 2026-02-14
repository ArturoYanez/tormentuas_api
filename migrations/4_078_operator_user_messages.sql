-- Mensajes del operador a usuarios
CREATE TABLE IF NOT EXISTS operator_user_messages (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_user_messages_operator ON operator_user_messages(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_user_messages_user ON operator_user_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_operator_user_messages_read ON operator_user_messages(is_read);
