-- Plantillas favoritas por agente
CREATE TABLE IF NOT EXISTS agent_template_favorites (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES support_templates(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_template_favorites_agent_id ON agent_template_favorites(agent_id);
