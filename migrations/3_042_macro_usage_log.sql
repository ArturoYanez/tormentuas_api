-- Log de uso de macros
CREATE TABLE IF NOT EXISTS macro_usage_log (
    id SERIAL PRIMARY KEY,
    macro_id INTEGER REFERENCES support_macros(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES support_agents(id),
    ticket_id INTEGER REFERENCES support_tickets(id),
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_macro_usage_log_macro_id ON macro_usage_log(macro_id);
