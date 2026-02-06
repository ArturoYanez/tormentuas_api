-- Dispositivos de confianza del agente
CREATE TABLE IF NOT EXISTS agent_trusted_devices (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    device_id VARCHAR(200),
    device_name VARCHAR(100),
    browser VARCHAR(50),
    os VARCHAR(50),
    is_trusted BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_trusted_devices_agent_id ON agent_trusted_devices(agent_id);
