-- Mensajes del chat interno

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'internal_chat_messages') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internal_chat_messages' AND column_name = 'room_id') THEN
            IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'accountant_chat_messages') THEN
                EXECUTE 'ALTER TABLE internal_chat_messages RENAME TO accountant_chat_messages';
            ELSE
                EXECUTE 'ALTER TABLE internal_chat_messages RENAME TO internal_chat_messages_backup';
            END IF;
        END IF;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS internal_chat_messages (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES internal_chat_rooms(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES support_agents(id),
    sender_role VARCHAR(15) CHECK (sender_role IN ('support', 'operator', 'admin')),
    message TEXT,
    reply_to INTEGER REFERENCES internal_chat_messages(id),
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_internal_chat_messages_room_id ON internal_chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_internal_chat_messages_sender_id ON internal_chat_messages(sender_id);
