-- Historial de búsquedas del agente
CREATE TABLE IF NOT EXISTS support_search_history (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    query VARCHAR(200),
    results_count INTEGER,
    clicked_result_type VARCHAR(50),
    clicked_result_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_support_search_history_agent_id ON support_search_history(agent_id);
