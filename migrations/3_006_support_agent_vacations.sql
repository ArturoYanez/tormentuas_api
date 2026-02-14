-- Vacaciones y ausencias del agente
CREATE TABLE IF NOT EXISTS support_agent_vacations (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    reason VARCHAR(200),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by INTEGER REFERENCES support_agents(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_agent_vacations_agent_id ON support_agent_vacations(agent_id);
CREATE INDEX IF NOT EXISTS idx_support_agent_vacations_dates ON support_agent_vacations(start_date, end_date);
