-- Migration: Support Agent Extended Features V2
-- Tablas adicionales para funcionalidades del panel de soporte

-- Tabla de colaboradores de tickets
CREATE TABLE IF NOT EXISTS ticket_collaborators (
    id SERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    agent_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(ticket_id, agent_id)
);

-- Tabla de notas personales del agente
CREATE TABLE IF NOT EXISTS agent_personal_notes (
    id SERIAL PRIMARY KEY,
    agent_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    color VARCHAR(20) DEFAULT '#3b82f6',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de notas de chat
CREATE TABLE IF NOT EXISTS chat_notes (
    id SERIAL PRIMARY KEY,
    chat_id BIGINT NOT NULL REFERENCES live_chats(id) ON DELETE CASCADE,
    agent_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Agregar columnas faltantes a support_tickets si no existen
DO $$ 
BEGIN
    -- merged_into: ID del ticket al que fue fusionado
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'merged_into') THEN
        ALTER TABLE support_tickets ADD COLUMN merged_into BIGINT REFERENCES support_tickets(id);
    END IF;
    
    -- merged_from: Array de IDs de tickets fusionados en este
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'merged_from') THEN
        ALTER TABLE support_tickets ADD COLUMN merged_from BIGINT[] DEFAULT '{}';
    END IF;
    
    -- rating_requested: Si se solicitó calificación
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'rating_requested') THEN
        ALTER TABLE support_tickets ADD COLUMN rating_requested BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- rating_requested_at: Cuándo se solicitó
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'rating_requested_at') THEN
        ALTER TABLE support_tickets ADD COLUMN rating_requested_at TIMESTAMP;
    END IF;
    
    -- escalated_to: A quién fue escalado
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'escalated_to') THEN
        ALTER TABLE support_tickets ADD COLUMN escalated_to VARCHAR(50);
    END IF;
    
    -- escalated_at: Cuándo fue escalado
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'escalated_at') THEN
        ALTER TABLE support_tickets ADD COLUMN escalated_at TIMESTAMP;
    END IF;
    
    -- source: Origen del ticket (web, chat, email, etc.)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'source') THEN
        ALTER TABLE support_tickets ADD COLUMN source VARCHAR(20) DEFAULT 'web';
    END IF;
END $$;

-- Agregar columnas faltantes a support_templates si no existen
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_templates' AND column_name = 'is_favorite') THEN
        ALTER TABLE support_templates ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_templates' AND column_name = 'usage_count') THEN
        ALTER TABLE support_templates ADD COLUMN usage_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Agregar columnas faltantes a live_chats si no existen
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_chats' AND column_name = 'rating_requested') THEN
        ALTER TABLE live_chats ADD COLUMN rating_requested BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_chats' AND column_name = 'rating') THEN
        ALTER TABLE live_chats ADD COLUMN rating INTEGER;
    END IF;
END $$;

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_ticket_collaborators_ticket ON ticket_collaborators(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_collaborators_agent ON ticket_collaborators(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_personal_notes_agent ON agent_personal_notes(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_notes_chat ON chat_notes(chat_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_merged_into ON support_tickets(merged_into) WHERE merged_into IS NOT NULL;
