-- Carga de trabajo actual del agente
CREATE TABLE IF NOT EXISTS agent_workload (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE UNIQUE,
    active_tickets INTEGER DEFAULT 0,
    active_chats INTEGER DEFAULT 0,
    max_tickets INTEGER DEFAULT 10,
    max_chats INTEGER DEFAULT 3,
    is_accepting_new BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_workload_agent_id ON agent_workload(agent_id);
