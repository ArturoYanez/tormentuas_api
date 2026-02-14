-- Tokens de API del agente
CREATE TABLE IF NOT EXISTS agent_api_tokens (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    name VARCHAR(100),
    token_hash VARCHAR(255),
    token_prefix VARCHAR(20),
    permissions JSONB,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_api_tokens_agent_id ON agent_api_tokens(agent_id);
