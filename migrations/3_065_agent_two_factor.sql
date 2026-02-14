-- Configuración 2FA del agente
CREATE TABLE IF NOT EXISTS agent_two_factor (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE UNIQUE,
    is_enabled BOOLEAN DEFAULT FALSE,
    secret VARCHAR(100),
    backup_codes JSONB,
    backup_codes_used INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    enabled_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_two_factor_agent_id ON agent_two_factor(agent_id);
