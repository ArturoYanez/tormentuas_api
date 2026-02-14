-- Preguntas de seguridad del agente
CREATE TABLE IF NOT EXISTS agent_security_questions (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    question VARCHAR(200),
    answer_hash VARCHAR(255),
    position INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_security_questions_agent_id ON agent_security_questions(agent_id);
