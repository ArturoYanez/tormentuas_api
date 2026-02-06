-- Tickets de soporte
CREATE TABLE IF NOT EXISTS support_tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(20) UNIQUE,
    user_id INTEGER REFERENCES users(id),
    user_od_id VARCHAR(20),
    subject VARCHAR(200),
    description TEXT,
    category VARCHAR(20) DEFAULT 'other' CHECK (category IN ('withdrawal', 'deposit', 'account', 'trading', 'technical', 'verification', 'bonus', 'other')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'escalated', 'resolved', 'closed')),
    assigned_to INTEGER REFERENCES support_agents(id),
    escalated_to VARCHAR(50),
    escalated_by INTEGER REFERENCES support_agents(id),
    escalation_reason TEXT,
    language VARCHAR(5) DEFAULT 'es',
    sla_deadline TIMESTAMP,
    sla_breached BOOLEAN DEFAULT FALSE,
    waiting_since TIMESTAMP,
    first_response_at TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,
    rating INTEGER,
    rating_comment TEXT,
    merged_into INTEGER REFERENCES support_tickets(id),
    source VARCHAR(10) DEFAULT 'web' CHECK (source IN ('web', 'chat', 'email', 'phone')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_sla_deadline ON support_tickets(sla_deadline);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at);
