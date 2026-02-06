-- Miembros de grupos de chat
CREATE TABLE IF NOT EXISTS internal_chat_group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES internal_chat_groups(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_internal_chat_group_members_group ON internal_chat_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_internal_chat_group_members_user ON internal_chat_group_members(user_id);
