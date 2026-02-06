-- Migration 008: Support Agent Extended Features V3
-- Adds: Schedule, SLA, Attachments, Chat Transfers, Categories

-- ========== AGENT SCHEDULE ==========

-- Horario de trabajo del agente
CREATE TABLE IF NOT EXISTS agent_schedule (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    is_working_day BOOLEAN DEFAULT TRUE,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(agent_id, day_of_week)
);

-- Pausas programadas del agente
CREATE TABLE IF NOT EXISTS agent_breaks (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Vacaciones y ausencias del agente
CREATE TABLE IF NOT EXISTS agent_vacations (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(200),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== SLA POLICIES ==========

-- Políticas de SLA
CREATE TABLE IF NOT EXISTS sla_policies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    priority VARCHAR(20),
    first_response_hours INTEGER NOT NULL DEFAULT 4,
    resolution_hours INTEGER NOT NULL DEFAULT 24,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Incumplimientos de SLA
CREATE TABLE IF NOT EXISTS sla_breaches (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    policy_id INTEGER REFERENCES sla_policies(id),
    breach_type VARCHAR(20) NOT NULL CHECK (breach_type IN ('first_response', 'resolution')),
    expected_at TIMESTAMP NOT NULL,
    breached_at TIMESTAMP NOT NULL,
    time_exceeded_minutes INTEGER,
    agent_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Priorización de cola de tickets
CREATE TABLE IF NOT EXISTS ticket_queue_priority (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE UNIQUE,
    sla_status VARCHAR(20) DEFAULT 'ok' CHECK (sla_status IN ('ok', 'warning', 'critical', 'breached')),
    sla_minutes_remaining INTEGER,
    priority_score INTEGER DEFAULT 0,
    calculated_at TIMESTAMP DEFAULT NOW()
);

-- ========== ATTACHMENTS ==========

-- Archivos adjuntos de tickets
CREATE TABLE IF NOT EXISTS ticket_attachments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    message_id INTEGER REFERENCES ticket_messages(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Archivos adjuntos de chat en vivo
CREATE TABLE IF NOT EXISTS live_chat_attachments (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL REFERENCES live_chats(id) ON DELETE CASCADE,
    message_id INTEGER REFERENCES live_chat_messages(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== CHAT TRANSFERS ==========

-- Transferencias de chat entre agentes
CREATE TABLE IF NOT EXISTS live_chat_transfers (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL REFERENCES live_chats(id) ON DELETE CASCADE,
    from_agent_id INTEGER NOT NULL REFERENCES users(id),
    to_agent_id INTEGER NOT NULL REFERENCES users(id),
    reason TEXT,
    accepted BOOLEAN DEFAULT FALSE,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Cola de chats en espera
CREATE TABLE IF NOT EXISTS chat_queue (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL REFERENCES live_chats(id) ON DELETE CASCADE UNIQUE,
    priority INTEGER DEFAULT 0,
    language VARCHAR(5) DEFAULT 'es',
    category VARCHAR(50),
    entered_at TIMESTAMP DEFAULT NOW(),
    assigned_at TIMESTAMP
);

-- ========== CATEGORIES ==========

-- Categorías de tickets (si no existe)
CREATE TABLE IF NOT EXISTS ticket_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20) DEFAULT '#3b82f6',
    sla_hours INTEGER DEFAULT 24,
    default_priority VARCHAR(20) DEFAULT 'medium',
    auto_assign_to INTEGER REFERENCES users(id),
    parent_id INTEGER REFERENCES ticket_categories(id),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Categorías de FAQs (si no existe)
CREATE TABLE IF NOT EXISTS faq_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Feedback de FAQs
CREATE TABLE IF NOT EXISTS faq_feedback (
    id SERIAL PRIMARY KEY,
    faq_id INTEGER NOT NULL REFERENCES faq_articles(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    is_helpful BOOLEAN NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Categorías de plantillas
CREATE TABLE IF NOT EXISTS template_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== QUICK REPLIES ==========

-- Respuestas rápidas para chat
CREATE TABLE IF NOT EXISTS quick_replies (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    category VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== TICKET HISTORY ==========

-- Historial de cambios en tickets
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

-- ========== INDEXES ==========

CREATE INDEX IF NOT EXISTS idx_agent_schedule_agent ON agent_schedule(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_breaks_agent ON agent_breaks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_vacations_agent ON agent_vacations(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_vacations_dates ON agent_vacations(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_sla_breaches_ticket ON sla_breaches(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_queue_priority_score ON ticket_queue_priority(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket ON ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_live_chat_attachments_chat ON live_chat_attachments(chat_id);
CREATE INDEX IF NOT EXISTS idx_live_chat_transfers_chat ON live_chat_transfers(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_queue_priority ON chat_queue(priority DESC, entered_at ASC);
CREATE INDEX IF NOT EXISTS idx_ticket_history_ticket ON ticket_history(ticket_id);
CREATE INDEX IF NOT EXISTS idx_faq_feedback_faq ON faq_feedback(faq_id);

-- ========== DEFAULT DATA ==========

-- Insertar políticas SLA por defecto
INSERT INTO sla_policies (name, category, priority, first_response_hours, resolution_hours) VALUES
('Urgente', NULL, 'urgent', 1, 4),
('Alta', NULL, 'high', 2, 8),
('Media', NULL, 'medium', 4, 24),
('Baja', NULL, 'low', 8, 48)
ON CONFLICT DO NOTHING;

-- Insertar categorías de tickets por defecto
INSERT INTO ticket_categories (name, slug, icon, color, sla_hours) VALUES
('Retiros', 'withdrawal', 'wallet', '#ef4444', 4),
('Depósitos', 'deposit', 'credit-card', '#22c55e', 8),
('Cuenta', 'account', 'user', '#3b82f6', 24),
('Trading', 'trading', 'trending-up', '#f59e0b', 12),
('Técnico', 'technical', 'settings', '#8b5cf6', 24),
('Verificación', 'verification', 'shield', '#06b6d4', 8),
('Bonos', 'bonus', 'gift', '#ec4899', 24),
('Otro', 'other', 'help-circle', '#6b7280', 48)
ON CONFLICT (slug) DO NOTHING;

-- Insertar categorías de FAQs por defecto
INSERT INTO faq_categories (name, slug, icon, display_order) VALUES
('Cuenta', 'cuenta', 'user', 1),
('Depósitos', 'depositos', 'credit-card', 2),
('Retiros', 'retiros', 'wallet', 3),
('Trading', 'trading', 'trending-up', 4),
('Verificación', 'verificacion', 'shield', 5),
('Bonos', 'bonos', 'gift', 6),
('Técnico', 'tecnico', 'settings', 7),
('General', 'general', 'help-circle', 8)
ON CONFLICT (slug) DO NOTHING;

-- Insertar respuestas rápidas por defecto
INSERT INTO quick_replies (text, category, display_order) VALUES
('¡Hola! ¿En qué puedo ayudarte?', 'greeting', 1),
('Un momento, estoy revisando tu caso.', 'general', 2),
('¿Podrías proporcionarme más detalles?', 'general', 3),
('Gracias por tu paciencia.', 'general', 4),
('¿Hay algo más en lo que pueda ayudarte?', 'closing', 5),
('¡Gracias por contactarnos! Que tengas un excelente día.', 'closing', 6)
ON CONFLICT DO NOTHING;

-- Agregar columnas faltantes a support_tickets si no existen
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'sla_deadline') THEN
        ALTER TABLE support_tickets ADD COLUMN sla_deadline TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'sla_breached') THEN
        ALTER TABLE support_tickets ADD COLUMN sla_breached BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'merged_into') THEN
        ALTER TABLE support_tickets ADD COLUMN merged_into INTEGER REFERENCES support_tickets(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'merged_from') THEN
        ALTER TABLE support_tickets ADD COLUMN merged_from BIGINT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'rating_requested') THEN
        ALTER TABLE support_tickets ADD COLUMN rating_requested BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'rating_requested_at') THEN
        ALTER TABLE support_tickets ADD COLUMN rating_requested_at TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'category_id') THEN
        ALTER TABLE support_tickets ADD COLUMN category_id INTEGER REFERENCES ticket_categories(id);
    END IF;
END $$;

-- Agregar columnas faltantes a live_chats si no existen
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_chats' AND column_name = 'language') THEN
        ALTER TABLE live_chats ADD COLUMN language VARCHAR(5) DEFAULT 'es';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_chats' AND column_name = 'rating') THEN
        ALTER TABLE live_chats ADD COLUMN rating INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_chats' AND column_name = 'rating_comment') THEN
        ALTER TABLE live_chats ADD COLUMN rating_comment TEXT;
    END IF;
END $$;
