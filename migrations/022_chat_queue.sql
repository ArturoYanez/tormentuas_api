-- Cola de chats en espera
CREATE TABLE IF NOT EXISTS chat_queue (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES live_chat_sessions(id) UNIQUE,
    priority INTEGER DEFAULT 0,
    language VARCHAR(5),
    category VARCHAR(50),
    entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_at TIMESTAMP
);

CREATE INDEX idx_chat_queue_priority ON chat_queue(priority);
