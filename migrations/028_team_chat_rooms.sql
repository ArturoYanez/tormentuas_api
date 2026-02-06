-- Salas de chat del equipo
CREATE TABLE IF NOT EXISTS team_chat_rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) DEFAULT 'general',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES operators(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_team_chat_rooms_type ON team_chat_rooms(type);
CREATE INDEX IF NOT EXISTS idx_team_chat_rooms_active ON team_chat_rooms(is_active);
