-- Salas de chat interno
CREATE TABLE IF NOT EXISTS internal_chat_rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    type VARCHAR(20) DEFAULT 'general' CHECK (type IN ('general', 'direct', 'announcements', 'department')),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES support_agents(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_internal_chat_rooms_type ON internal_chat_rooms(type);
