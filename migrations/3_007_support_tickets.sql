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

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'support_tickets' AND column_name = 'category'
    ) THEN
        ALTER TABLE support_tickets ADD COLUMN category VARCHAR(20) DEFAULT 'other';
        -- Add constraint if needed? The CHECK constraint is usually added with the column in a proper migration,
        -- but here we might need to add it separately or trust the app validation?
        -- Let's add it:
        ALTER TABLE support_tickets ADD CONSTRAINT support_tickets_category_check CHECK (category IN ('withdrawal', 'deposit', 'account', 'trading', 'technical', 'verification', 'bonus', 'other'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'support_tickets' AND column_name = 'priority'
    ) THEN
        ALTER TABLE support_tickets ADD COLUMN priority VARCHAR(10) DEFAULT 'medium';
         ALTER TABLE support_tickets ADD CONSTRAINT support_tickets_priority_check CHECK (priority IN ('urgent', 'high', 'medium', 'low'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'support_tickets' AND column_name = 'status'
    ) THEN
        ALTER TABLE support_tickets ADD COLUMN status VARCHAR(20) DEFAULT 'open';
         ALTER TABLE support_tickets ADD CONSTRAINT support_tickets_status_check CHECK (status IN ('open', 'in_progress', 'waiting', 'escalated', 'resolved', 'closed'));
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'support_tickets' AND column_name = 'assigned_to'
    ) THEN
        ALTER TABLE support_tickets ADD COLUMN assigned_to INTEGER REFERENCES support_agents(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'support_tickets' AND column_name = 'sla_deadline'
    ) THEN
        ALTER TABLE support_tickets ADD COLUMN sla_deadline TIMESTAMP;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'support_tickets' AND column_name = 'sla_breached'
    ) THEN
        ALTER TABLE support_tickets ADD COLUMN sla_breached BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'support_tickets' AND column_name = 'merged_into'
    ) THEN
        ALTER TABLE support_tickets ADD COLUMN merged_into INTEGER REFERENCES support_tickets(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'support_tickets' AND column_name = 'source'
    ) THEN
        ALTER TABLE support_tickets ADD COLUMN source VARCHAR(10) DEFAULT 'web';
        ALTER TABLE support_tickets ADD CONSTRAINT support_tickets_source_check CHECK (source IN ('web', 'chat', 'email', 'phone'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_sla_deadline ON support_tickets(sla_deadline);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);
