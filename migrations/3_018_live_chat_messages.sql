-- Mensajes del chat en vivo
CREATE TABLE IF NOT EXISTS live_chat_messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES live_chat_sessions(id) ON DELETE CASCADE,
    sender_type VARCHAR(10) CHECK (sender_type IN ('user', 'support', 'bot', 'system')),
    sender_id INTEGER,
    sender_name VARCHAR(100),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'live_chat_messages' AND column_name = 'session_id'
    ) THEN
        ALTER TABLE live_chat_messages ADD COLUMN session_id INTEGER REFERENCES live_chat_sessions(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_live_chat_messages_session_id ON live_chat_messages(session_id);
