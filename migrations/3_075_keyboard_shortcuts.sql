-- Atajos de teclado personalizados
CREATE TABLE IF NOT EXISTS keyboard_shortcuts (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    action VARCHAR(100),
    keys VARCHAR(50),
    is_custom BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_keyboard_shortcuts_agent_id ON keyboard_shortcuts(agent_id);
