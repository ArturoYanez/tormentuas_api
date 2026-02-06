-- =====================================================
-- MIGRACIÓN 006 - TABLAS EXTENDIDAS PARA PANEL DE SOPORTE
-- Notificaciones, Canned Responses, Macros, Chat Interno, Agentes
-- =====================================================

-- ========== PARTE 1: NOTIFICACIONES DEL AGENTE ==========

-- Notificaciones para agentes de soporte
CREATE TABLE IF NOT EXISTS agent_notifications (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES users(id),
    notification_type VARCHAR(50) NOT NULL, -- ticket, chat, sla, escalation, system, rating
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link VARCHAR(500),
    reference_type VARCHAR(50), -- ticket, chat, user
    reference_id INTEGER,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_notifications_agent ON agent_notifications(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_notifications_read ON agent_notifications(agent_id, is_read);

-- ========== PARTE 2: CANNED RESPONSES + MACROS ==========

-- Respuestas rápidas predefinidas
CREATE TABLE IF NOT EXISTS canned_responses (
    id SERIAL PRIMARY KEY,
    shortcut VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    created_by INTEGER REFERENCES users(id),
    is_global BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_canned_responses_shortcut ON canned_responses(shortcut);
CREATE INDEX IF NOT EXISTS idx_canned_responses_category ON canned_responses(category);

-- Macros (acciones automatizadas)
CREATE TABLE IF NOT EXISTS support_macros (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    actions JSONB NOT NULL DEFAULT '[]', -- [{type: 'reply', value: '...'}, {type: 'status', value: 'resolved'}]
    created_by INTEGER REFERENCES users(id),
    is_global BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== PARTE 3: AGENTES + STATUS ==========

-- Estado y configuración de agentes
CREATE TABLE IF NOT EXISTS agent_status (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES users(id) UNIQUE,
    status VARCHAR(20) DEFAULT 'available', -- available, busy, away, dnd
    status_message VARCHAR(255),
    max_concurrent_chats INTEGER DEFAULT 3,
    max_concurrent_tickets INTEGER DEFAULT 10,
    current_chats INTEGER DEFAULT 0,
    current_tickets INTEGER DEFAULT 0,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_status_status ON agent_status(status);

-- ========== PARTE 4: CHAT INTERNO ==========

-- Mensajes internos entre agentes/operadores/admins
CREATE TABLE IF NOT EXISTS internal_messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    recipient_id INTEGER REFERENCES users(id), -- NULL para mensajes generales
    channel VARCHAR(50) DEFAULT 'general', -- general, direct, announcements
    message TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_internal_messages_sender ON internal_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_recipient ON internal_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_channel ON internal_messages(channel);

-- ========== PARTE 5: REPORTS/ANALYTICS ==========

-- Estadísticas diarias de agentes
CREATE TABLE IF NOT EXISTS agent_daily_stats (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES users(id),
    stat_date DATE NOT NULL,
    tickets_assigned INTEGER DEFAULT 0,
    tickets_resolved INTEGER DEFAULT 0,
    tickets_escalated INTEGER DEFAULT 0,
    chats_handled INTEGER DEFAULT 0,
    avg_response_time_seconds INTEGER DEFAULT 0,
    avg_resolution_time_seconds INTEGER DEFAULT 0,
    total_messages_sent INTEGER DEFAULT 0,
    satisfaction_sum INTEGER DEFAULT 0,
    satisfaction_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, stat_date)
);

CREATE INDEX IF NOT EXISTS idx_agent_daily_stats_date ON agent_daily_stats(stat_date);
CREATE INDEX IF NOT EXISTS idx_agent_daily_stats_agent ON agent_daily_stats(agent_id);

-- ========== PARTE 6: SETTINGS ==========

-- Configuración del agente
CREATE TABLE IF NOT EXISTS agent_settings (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES users(id) UNIQUE,
    -- Notificaciones
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sound_enabled BOOLEAN DEFAULT true,
    sla_alert_minutes INTEGER DEFAULT 15,
    -- Apariencia
    dark_mode BOOLEAN DEFAULT false,
    language VARCHAR(10) DEFAULT 'es',
    timezone VARCHAR(100) DEFAULT 'America/Mexico_City',
    -- Auto-respuestas
    away_message TEXT,
    out_of_hours_message TEXT,
    auto_greeting TEXT,
    -- Horario
    work_schedule JSONB DEFAULT '{}',
    -- Firma
    signature TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== DATOS INICIALES ==========

-- Insertar canned responses de ejemplo
INSERT INTO canned_responses (shortcut, title, content, category) VALUES
('/hola', 'Saludo', '¡Hola! Gracias por contactarnos. ¿En qué puedo ayudarte hoy?', 'General'),
('/espera', 'Espera', 'Dame un momento mientras reviso tu caso...', 'General'),
('/gracias', 'Agradecimiento', '¡Gracias por tu paciencia! ¿Hay algo más en lo que pueda ayudarte?', 'General'),
('/retiro', 'Info Retiro', 'Los retiros se procesan en 24-48 horas hábiles una vez verificada tu cuenta.', 'Retiros'),
('/verificar', 'Verificación', 'Para verificar tu cuenta necesitas: 1) Documento de identidad, 2) Comprobante de domicilio reciente.', 'Cuenta'),
('/deposito', 'Info Depósito', 'Los depósitos en criptomonedas se acreditan después de las confirmaciones requeridas en la red.', 'Depósitos'),
('/cierre', 'Cierre', '¿Hay algo más en lo que pueda ayudarte? Si no, procederé a cerrar este ticket.', 'General')
ON CONFLICT DO NOTHING;

-- Insertar macros de ejemplo
INSERT INTO support_macros (name, description, actions) VALUES
('Resolver y agradecer', 'Resuelve el ticket y envía agradecimiento', '[{"type":"reply","value":"¡Tu caso ha sido resuelto! Gracias por contactarnos."},{"type":"status","value":"resolved"},{"type":"tag","value":"resuelto"}]'),
('Escalar a operador', 'Escala el ticket al operador', '[{"type":"status","value":"escalated"},{"type":"priority","value":"high"}]'),
('Solicitar info y esperar', 'Pide más información y pone en espera', '[{"type":"reply","value":"Necesito más información para ayudarte. Por favor proporciona los detalles solicitados."},{"type":"status","value":"waiting"}]'),
('Cerrar sin respuesta', 'Cierra ticket por falta de respuesta', '[{"type":"reply","value":"Cerramos este ticket por falta de respuesta. Si necesitas ayuda, abre uno nuevo."},{"type":"status","value":"closed"}]')
ON CONFLICT DO NOTHING;
