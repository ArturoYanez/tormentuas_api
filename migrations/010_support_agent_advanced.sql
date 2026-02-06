-- Migration 010: Support Agent Advanced Features
-- Adds: Agent Performance, SLA Breaches, Activity Logs, FAQ Categories CRUD

-- ========== AGENT DAILY STATS ==========
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
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== ACTIVITY LOGS ==========
CREATE TABLE IF NOT EXISTS agent_activity_logs (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    action_category VARCHAR(50) NOT NULL,
    target_type VARCHAR(50),
    target_id INTEGER,
    target_name VARCHAR(200),
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== ANNOUNCEMENTS ==========
CREATE TABLE IF NOT EXISTS support_announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'urgent', 'update')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    starts_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcement_reads (
    id SERIAL PRIMARY KEY,
    announcement_id INTEGER NOT NULL REFERENCES support_announcements(id) ON DELETE CASCADE,
    agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(announcement_id, agent_id)
);

-- ========== KNOWLEDGE ARTICLE VIEWS ==========
CREATE TABLE IF NOT EXISTS knowledge_article_views (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    viewer_id INTEGER REFERENCES users(id),
    viewer_type VARCHAR(20) DEFAULT 'agent',
    viewed_at TIMESTAMP DEFAULT NOW()
);

-- ========== INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_agent_daily_stats_agent_date ON agent_daily_stats(agent_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sla_breaches_ticket ON sla_breaches(ticket_id);
CREATE INDEX IF NOT EXISTS idx_sla_breaches_agent ON sla_breaches(agent_id);
CREATE INDEX IF NOT EXISTS idx_sla_breaches_unack ON sla_breaches(acknowledged) WHERE acknowledged = false;
CREATE INDEX IF NOT EXISTS idx_activity_logs_agent ON agent_activity_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON agent_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_category ON agent_activity_logs(action_category);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON support_announcements(is_active, starts_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_views_article ON knowledge_article_views(article_id);
