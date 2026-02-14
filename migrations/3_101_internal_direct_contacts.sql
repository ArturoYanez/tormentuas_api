-- Contactos directos para chat interno
CREATE TABLE IF NOT EXISTS internal_direct_contacts (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    contact_id INTEGER,
    contact_type VARCHAR(15) CHECK (contact_type IN ('support', 'operator', 'admin')),
    contact_name VARCHAR(100),
    is_favorite BOOLEAN DEFAULT FALSE,
    last_message_at TIMESTAMP,
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_internal_direct_contacts_agent_id ON internal_direct_contacts(agent_id);
