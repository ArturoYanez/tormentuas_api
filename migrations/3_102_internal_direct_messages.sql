-- Mensajes directos entre agentes
CREATE TABLE IF NOT EXISTS internal_direct_messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES support_agents(id),
    receiver_id INTEGER,
    receiver_type VARCHAR(15) CHECK (receiver_type IN ('support', 'operator', 'admin')),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    is_deleted_sender BOOLEAN DEFAULT FALSE,
    is_deleted_receiver BOOLEAN DEFAULT FALSE,
    reply_to INTEGER REFERENCES internal_direct_messages(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_internal_direct_messages_sender ON internal_direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_internal_direct_messages_receiver ON internal_direct_messages(receiver_id, receiver_type);
