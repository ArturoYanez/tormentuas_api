-- Migration 011: Support Agent Advanced Features V2
-- Internal Chat Rooms, Reactions, Sessions, Search, Shortcuts, Video Calls, AI, Roles, etc.

-- ========== INTERNAL CHAT ROOMS ==========
CREATE TABLE IF NOT EXISTS internal_chat_rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) DEFAULT 'general' CHECK (type IN ('general', 'direct', 'announcements', 'department')),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS internal_chat_members (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES internal_chat_rooms(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP DEFAULT NOW(),
    last_read_at TIMESTAMP,
    UNIQUE(room_id, agent_id)
);

CREATE TABLE IF NOT EXISTS internal_chat_room_messages (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES internal_chat_rooms(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    reply_to INTEGER REFERENCES internal_chat_room_messages(id),
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    edited_at TIMESTAMP
);

-- ========== CHAT REACTIONS & MENTIONS ==========
CREATE TABLE IF NOT EXISTS internal_chat_reactions (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES internal_chat_room_messages(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(message_id, agent_id, emoji)
);

CREATE TABLE IF NOT EXISTS internal_chat_mentions (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES internal_chat_room_messages(id) ON DELETE CASCADE,
    mentioned_agent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== AGENT SESSIONS ==========
CREATE TABLE IF NOT EXISTS support_agent_sessions (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    device VARCHAR(200),
    ip_address VARCHAR(45),
    location VARCHAR(100),
    token VARCHAR(500),
    is_current BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- ========== AGENT LOGIN HISTORY ==========
CREATE TABLE IF NOT EXISTS agent_login_history (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    device VARCHAR(200),
    location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'blocked')),
    failure_reason VARCHAR(100),
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== API TOKENS ==========
CREATE TABLE IF NOT EXISTS agent_api_tokens (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    token_prefix VARCHAR(20),
    permissions JSONB DEFAULT '[]',
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== WEBHOOKS ==========
CREATE TABLE IF NOT EXISTS agent_webhooks (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    events JSONB DEFAULT '[]',
    secret VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMP,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_logs (
    id SERIAL PRIMARY KEY,
    webhook_id INTEGER REFERENCES agent_webhooks(id) ON DELETE CASCADE,
    event VARCHAR(50),
    payload JSONB,
    response_status INTEGER,
    response_body TEXT,
    success BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== GLOBAL SEARCH ==========
CREATE TABLE IF NOT EXISTS search_index (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('ticket', 'user', 'faq', 'article', 'template')),
    entity_id INTEGER NOT NULL,
    title VARCHAR(500),
    content TEXT,
    metadata JSONB,
    search_vector TSVECTOR,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    query VARCHAR(200) NOT NULL,
    results_count INTEGER DEFAULT 0,
    clicked_result_type VARCHAR(50),
    clicked_result_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== KEYBOARD SHORTCUTS ==========
CREATE TABLE IF NOT EXISTS keyboard_shortcuts (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    keys VARCHAR(50) NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS default_shortcuts (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(200),
    keys VARCHAR(50) NOT NULL,
    is_editable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== VIDEO CALLS ==========
CREATE TABLE IF NOT EXISTS support_video_calls (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id),
    agent_id INTEGER REFERENCES users(id),
    scheduled_at TIMESTAMP,
    duration_minutes INTEGER DEFAULT 30,
    meeting_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    recording_url VARCHAR(500),
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== AI SUGGESTIONS ==========
CREATE TABLE IF NOT EXISTS ai_response_suggestions (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
    message_id INTEGER,
    suggested_response TEXT NOT NULL,
    confidence DECIMAL(5,4) DEFAULT 0,
    was_used BOOLEAN DEFAULT FALSE,
    was_modified BOOLEAN DEFAULT FALSE,
    agent_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    used_at TIMESTAMP
);

-- ========== ROLES & PERMISSIONS ==========
CREATE TABLE IF NOT EXISTS support_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_roles (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES support_roles(id) ON DELETE CASCADE,
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(agent_id, role_id)
);

CREATE TABLE IF NOT EXISTS support_permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- ========== AUTO ASSIGNMENT RULES ==========
CREATE TABLE IF NOT EXISTS auto_assignment_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    conditions JSONB DEFAULT '{}',
    assignment_type VARCHAR(20) DEFAULT 'round_robin' CHECK (assignment_type IN ('round_robin', 'least_busy', 'skill_based')),
    target_agents JSONB DEFAULT '[]',
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_workload (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    active_tickets INTEGER DEFAULT 0,
    active_chats INTEGER DEFAULT 0,
    max_tickets INTEGER DEFAULT 10,
    max_chats INTEGER DEFAULT 3,
    is_accepting_new BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ========== DATA EXPORTS ==========
CREATE TABLE IF NOT EXISTS data_exports (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    export_type VARCHAR(20) NOT NULL CHECK (export_type IN ('tickets', 'users', 'chats', 'reports', 'all')),
    filters JSONB DEFAULT '{}',
    format VARCHAR(10) DEFAULT 'csv' CHECK (format IN ('csv', 'excel', 'json', 'pdf')),
    file_url VARCHAR(500),
    file_size INTEGER,
    row_count INTEGER,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    expires_at TIMESTAMP
);

-- ========== CSAT/NPS SURVEYS ==========
CREATE TABLE IF NOT EXISTS csat_surveys (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE SET NULL,
    chat_session_id INTEGER,
    user_id INTEGER REFERENCES users(id),
    agent_id INTEGER REFERENCES users(id),
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    response_time_rating INTEGER CHECK (response_time_rating >= 1 AND response_time_rating <= 5),
    resolution_rating INTEGER CHECK (resolution_rating >= 1 AND resolution_rating <= 5),
    professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    would_recommend BOOLEAN,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nps_scores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    score INTEGER CHECK (score >= 0 AND score <= 10),
    feedback TEXT,
    source VARCHAR(20) DEFAULT 'ticket' CHECK (source IN ('ticket', 'chat', 'email', 'app')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== TYPING INDICATORS ==========
CREATE TABLE IF NOT EXISTS typing_indicators (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER,
    chat_type VARCHAR(20) CHECK (chat_type IN ('live_chat', 'internal', 'ticket')),
    user_id INTEGER REFERENCES users(id),
    is_typing BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ========== SAVED FILTERS ==========
CREATE TABLE IF NOT EXISTS saved_ticket_filters (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    filters JSONB NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    is_shared BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ========== DASHBOARD WIDGETS ==========
CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    widget_type VARCHAR(50) NOT NULL,
    title VARCHAR(100),
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER DEFAULT 1,
    height INTEGER DEFAULT 1,
    settings JSONB DEFAULT '{}',
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dashboard_stats_cache (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    stat_type VARCHAR(50) NOT NULL,
    stat_value JSONB,
    calculated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    UNIQUE(agent_id, stat_type)
);

-- ========== PINNED MESSAGES ==========
CREATE TABLE IF NOT EXISTS pinned_messages (
    id SERIAL PRIMARY KEY,
    message_type VARCHAR(20) CHECK (message_type IN ('ticket', 'chat', 'internal')),
    message_id INTEGER NOT NULL,
    pinned_by INTEGER REFERENCES users(id),
    pinned_at TIMESTAMP DEFAULT NOW()
);

-- ========== INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_chat_rooms_type ON internal_chat_rooms(type);
CREATE INDEX IF NOT EXISTS idx_chat_members_agent ON internal_chat_members(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_messages_room ON internal_chat_room_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_reactions_message ON internal_chat_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_mentions_agent ON internal_chat_mentions(mentioned_agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_agent ON support_agent_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_login_history_agent ON agent_login_history(agent_id);
CREATE INDEX IF NOT EXISTS idx_api_tokens_agent ON agent_api_tokens(agent_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_agent ON agent_webhooks(agent_id);
CREATE INDEX IF NOT EXISTS idx_search_index_type ON search_index(entity_type);
CREATE INDEX IF NOT EXISTS idx_search_history_agent ON search_history(agent_id);
CREATE INDEX IF NOT EXISTS idx_shortcuts_agent ON keyboard_shortcuts(agent_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_agent ON support_video_calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_ticket ON ai_response_suggestions(ticket_id);
CREATE INDEX IF NOT EXISTS idx_agent_roles_agent ON agent_roles(agent_id);
CREATE INDEX IF NOT EXISTS idx_assignment_rules_active ON auto_assignment_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_data_exports_agent ON data_exports(agent_id);
CREATE INDEX IF NOT EXISTS idx_csat_surveys_agent ON csat_surveys(agent_id);
CREATE INDEX IF NOT EXISTS idx_saved_filters_agent ON saved_ticket_filters(agent_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_agent ON dashboard_widgets(agent_id);

-- Insert default shortcuts
INSERT INTO default_shortcuts (action, description, keys) VALUES
    ('new_ticket', 'Crear nuevo ticket', 'Ctrl+N'),
    ('search', 'Búsqueda global', 'Ctrl+K'),
    ('close_ticket', 'Cerrar ticket actual', 'Ctrl+Shift+C'),
    ('reply', 'Responder ticket', 'Ctrl+Enter'),
    ('assign_me', 'Asignarme ticket', 'Ctrl+M'),
    ('escalate', 'Escalar ticket', 'Ctrl+E'),
    ('toggle_sidebar', 'Mostrar/ocultar sidebar', 'Ctrl+B'),
    ('next_ticket', 'Siguiente ticket', 'Ctrl+J'),
    ('prev_ticket', 'Ticket anterior', 'Ctrl+K'),
    ('refresh', 'Refrescar datos', 'F5')
ON CONFLICT (action) DO NOTHING;

-- Insert default roles
INSERT INTO support_roles (name, description, permissions) VALUES
    ('support_agent', 'Agente de soporte básico', '["tickets.view", "tickets.reply", "chats.handle", "faqs.view"]'),
    ('senior_agent', 'Agente senior', '["tickets.view", "tickets.reply", "tickets.escalate", "chats.handle", "faqs.manage", "templates.manage"]'),
    ('team_lead', 'Líder de equipo', '["tickets.all", "chats.all", "agents.view", "reports.view", "faqs.manage", "templates.manage"]'),
    ('support_admin', 'Administrador de soporte', '["all"]')
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO support_permissions (name, code, category, description) VALUES
    ('Ver tickets', 'tickets.view', 'tickets', 'Puede ver tickets'),
    ('Responder tickets', 'tickets.reply', 'tickets', 'Puede responder tickets'),
    ('Escalar tickets', 'tickets.escalate', 'tickets', 'Puede escalar tickets'),
    ('Gestionar tickets', 'tickets.all', 'tickets', 'Acceso completo a tickets'),
    ('Manejar chats', 'chats.handle', 'chats', 'Puede atender chats'),
    ('Gestionar chats', 'chats.all', 'chats', 'Acceso completo a chats'),
    ('Ver FAQs', 'faqs.view', 'faqs', 'Puede ver FAQs'),
    ('Gestionar FAQs', 'faqs.manage', 'faqs', 'Puede crear/editar FAQs'),
    ('Gestionar plantillas', 'templates.manage', 'templates', 'Puede gestionar plantillas'),
    ('Ver agentes', 'agents.view', 'agents', 'Puede ver lista de agentes'),
    ('Ver reportes', 'reports.view', 'reports', 'Puede ver reportes'),
    ('Acceso total', 'all', 'system', 'Acceso completo al sistema')
ON CONFLICT (code) DO NOTHING;

-- Insert default chat room
INSERT INTO internal_chat_rooms (name, type, description, created_by) VALUES
    ('General', 'general', 'Canal general del equipo de soporte', 1),
    ('Anuncios', 'announcements', 'Canal de anuncios oficiales', 1)
ON CONFLICT DO NOTHING;
