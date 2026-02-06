-- Grupos de chat interno
CREATE TABLE IF NOT EXISTS internal_chat_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_internal_chat_groups_creator ON internal_chat_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_internal_chat_groups_active ON internal_chat_groups(is_active);
