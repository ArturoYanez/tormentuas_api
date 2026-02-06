-- Asignación de roles a agentes
CREATE TABLE IF NOT EXISTS agent_roles (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES support_roles(id),
    assigned_by INTEGER REFERENCES support_agents(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_roles_agent_id ON agent_roles(agent_id);
