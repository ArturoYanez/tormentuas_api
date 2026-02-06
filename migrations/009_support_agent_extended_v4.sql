-- Migration 009: Support Agent Extended Features V4
-- Adds: FAQ Feedback, Ticket History, Chat Attachments, Agent Performance, SLA Breaches

-- ========== FAQ FEEDBACK (si no existe) ==========
CREATE TABLE IF NOT EXISTS faq_feedback (
    id SERIAL PRIMARY KEY,
    faq_id INTEGER NOT NULL REFERENCES faq_articles(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    is_helpful BOOLEAN NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== TICKET HISTORY ==========
CREATE TABLE IF NOT EXISTS ticket_history (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    performed_by INTEGER REFERENCES users(id),
    performed_by_name VARCHAR(100),
    performed_by_type VARCHAR(20) DEFAULT 'support',
    old_value TEXT,
    new_value TEXT,
    details TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== CHAT ATTACHMENTS ==========
CREATE TABLE IF NOT EXISTS live_chat_attachments (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL REFERENCES live_chats(id) ON DELETE CASCADE,
    message_id INTEGER REFERENCES live_chat_messages(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== AGENT PERFORMANCE ==========
CREATE TABLE IF NOT EXISTS agent_daily_stats (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    tickets_assigned INTEGER DEFAULT 0,
    tickets_resolved INTEGER DEFAULT 0,
    tickets_escalated INTEGER DEFAULT 0,
    chats_handled INTEGER DEFAULT 0,
    avg_response_time_minutes DECIMAL(10,2) DEFAULT 0,
    avg_resolution_time_minutes DECIMAL(10,2) DEFAULT 0,
    sla_compliance_rate DECIMAL(5,2) DEFAULT 100,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    ratings_count INTEGER DEFAULT 0,
    online_time_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(agent_id, date)
);

-- ========== SLA BREACHES ==========
CREATE TABLE IF NOT EXISTS sla_breaches (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    policy_id INTEGER REFERENCES sla_policies(id),
    breach_type VARCHAR(20) NOT NULL CHECK (breach_type IN ('first_response', 'resolution')),
    expected_at TIMESTAMP NOT NULL,
    breached_at TIMESTAMP NOT NULL,
    time_exceeded_minutes INTEGER,
    agent_id INTEGER REFERENCES users(id),
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP,
    acknowledged_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== KNOWLEDGE ARTICLE VIEWS ==========
CREATE TABLE IF NOT EXISTS knowledge_article_views (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    viewer_id INTEGER REFERENCES users(id),
    viewer_type VARCHAR(20) DEFAULT 'agent',
    viewed_at TIMESTAMP DEFAULT NOW()
);

-- ========== FAQ CATEGORIES CRUD ==========
-- Ya existe en migración anterior, solo asegurar datos

-- ========== INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_faq_feedback_faq ON faq_feedback(faq_id);
CREATE INDEX IF NOT EXISTS idx_ticket_history_ticket ON ticket_history(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_history_created ON ticket_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_chat_attachments_chat ON live_chat_attachments(chat_id);
CREATE INDEX IF NOT EXISTS idx_agent_daily_stats_agent_date ON agent_daily_stats(agent_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sla_breaches_ticket ON sla_breaches(ticket_id);
CREATE INDEX IF NOT EXISTS idx_sla_breaches_agent ON sla_breaches(agent_id);
CREATE INDEX IF NOT EXISTS idx_sla_breaches_unack ON sla_breaches(acknowledged) WHERE acknowledged = false;
CREATE INDEX IF NOT EXISTS idx_knowledge_views_article ON knowledge_article_views(article_id);

-- Agregar columna rating_requested a live_chats si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_chats' AND column_name = 'rating_requested') THEN
        ALTER TABLE live_chats ADD COLUMN rating_requested BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
