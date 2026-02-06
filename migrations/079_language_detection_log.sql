-- Log de detección de idioma
CREATE TABLE IF NOT EXISTS language_detection_log (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id),
    chat_session_id INTEGER REFERENCES live_chat_sessions(id),
    detected_language VARCHAR(5),
    confidence DECIMAL(5,4),
    text_sample TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_language_detection_log_ticket_id ON language_detection_log(ticket_id);
