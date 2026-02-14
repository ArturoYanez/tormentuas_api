-- Preferencias de toasts del agente
CREATE TABLE IF NOT EXISTS agent_toast_preferences (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE UNIQUE,
    show_success BOOLEAN DEFAULT TRUE,
    show_error BOOLEAN DEFAULT TRUE,
    show_info BOOLEAN DEFAULT TRUE,
    duration_ms INTEGER DEFAULT 3000,
    position VARCHAR(20) DEFAULT 'top-right' CHECK (position IN ('top-right', 'top-left', 'bottom-right', 'bottom-left')),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_toast_preferences_agent_id ON agent_toast_preferences(agent_id);
