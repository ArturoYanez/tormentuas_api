-- Archivos adjuntos de tickets
CREATE TABLE IF NOT EXISTS ticket_attachments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
    message_id INTEGER REFERENCES ticket_messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255),
    file_url VARCHAR(500),
    file_type VARCHAR(50),
    file_size INTEGER,
    uploaded_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_message_id ON ticket_attachments(message_id);
