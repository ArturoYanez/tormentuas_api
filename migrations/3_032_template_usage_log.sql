-- Log de uso de plantillas
CREATE TABLE IF NOT EXISTS template_usage_log (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES support_templates(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES support_agents(id),
    ticket_id INTEGER REFERENCES support_tickets(id),
    chat_session_id INTEGER REFERENCES live_chat_sessions(id),
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_template_usage_log_template_id ON template_usage_log(template_id);
