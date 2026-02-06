-- =====================================================
-- MIGRACIÓN 005 - TABLAS ADICIONALES PARA PANEL DE SOPORTE
-- =====================================================

-- Plantillas de respuesta para agentes de soporte
CREATE TABLE IF NOT EXISTS support_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    shortcut VARCHAR(50) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    content TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    usage_count INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Artículos de conocimiento interno
CREATE TABLE IF NOT EXISTS knowledge_articles (
    id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    views INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notas de usuarios (para agentes de soporte)
CREATE TABLE IF NOT EXISTS user_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    author_id INTEGER REFERENCES users(id),
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_support_templates_category ON support_templates(category);
CREATE INDEX IF NOT EXISTS idx_support_templates_shortcut ON support_templates(shortcut);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_category ON knowledge_articles(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_author ON knowledge_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_user ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_author ON user_notes(author_id);

-- Agregar columna is_published a faq_articles si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'faq_articles' AND column_name = 'is_published') THEN
        ALTER TABLE faq_articles ADD COLUMN is_published BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Insertar algunas plantillas de ejemplo
INSERT INTO support_templates (name, shortcut, category, content, variables) VALUES
('Saludo inicial', '/saludo', 'General', 'Hola {nombre}, gracias por contactar al soporte de TORMENTUS. Mi nombre es {agente} y estaré ayudándote hoy. ¿En qué puedo asistirte?', ARRAY['nombre', 'agente']),
('Retiro en proceso', '/retiro', 'Retiros', 'Tu retiro por {monto} está siendo procesado. El tiempo estimado es de {tiempo}. Te notificaremos por email cuando se complete.', ARRAY['monto', 'tiempo']),
('Verificación pendiente', '/verificacion', 'Cuenta', 'Hemos recibido tus documentos de verificación. Nuestro equipo los está revisando. Este proceso puede tomar hasta 24-48 horas hábiles.', ARRAY[]::TEXT[]),
('Solicitar información', '/info', 'General', 'Para poder ayudarte mejor, necesito que me proporciones la siguiente información: {info_requerida}', ARRAY['info_requerida']),
('Cierre de ticket', '/cierre', 'General', '¿Hay algo más en lo que pueda ayudarte? Si tu consulta ha sido resuelta, procederé a cerrar este ticket. ¡Gracias por elegir TORMENTUS!', ARRAY[]::TEXT[])
ON CONFLICT DO NOTHING;

-- Insertar algunas categorías de FAQ si no existen
INSERT INTO faq_categories (name, slug, description) VALUES
('Cuenta', 'cuenta', 'Preguntas sobre gestión de cuenta'),
('Depósitos', 'depositos', 'Preguntas sobre depósitos'),
('Retiros', 'retiros', 'Preguntas sobre retiros'),
('Trading', 'trading', 'Preguntas sobre operaciones'),
('Verificación', 'verificacion', 'Preguntas sobre KYC'),
('Bonos', 'bonos', 'Preguntas sobre promociones'),
('Técnico', 'tecnico', 'Problemas técnicos'),
('General', 'general', 'Preguntas generales')
ON CONFLICT DO NOTHING;

-- Insertar algunas FAQs de ejemplo
INSERT INTO faq_articles (category_id, title, slug, content, is_published) VALUES
((SELECT id FROM faq_categories WHERE slug = 'cuenta'), '¿Cómo verifico mi cuenta?', 'como-verifico-mi-cuenta', 'Para verificar tu cuenta:\n1. Ve a Configuración > Verificación\n2. Sube tu documento de identidad (INE, pasaporte o licencia)\n3. Sube un comprobante de domicilio reciente (menos de 3 meses)\n4. Espera la revisión (24-48 horas)', true),
((SELECT id FROM faq_categories WHERE slug = 'retiros'), '¿Cuánto tarda un retiro?', 'cuanto-tarda-un-retiro', 'Los tiempos de retiro varían según el método:\n- Criptomonedas: 1-24 horas\n- Transferencia bancaria: 2-5 días hábiles\n- E-wallets: 24-48 horas\n\nNota: Tu cuenta debe estar verificada para procesar retiros.', true),
((SELECT id FROM faq_categories WHERE slug = 'trading'), '¿Cómo funciona el trading?', 'como-funciona-el-trading', '1. Selecciona un activo (divisas, cripto, acciones)\n2. Elige el monto a invertir\n3. Predice si el precio subirá o bajará\n4. Selecciona el tiempo de expiración\n5. Confirma tu operación', true)
ON CONFLICT DO NOTHING;

-- Insertar artículos de conocimiento de ejemplo
INSERT INTO knowledge_articles (author_id, title, category, content, tags, is_published) VALUES
(1, 'Guía completa de verificación KYC', 'Procesos', '# Verificación KYC\n\n## Documentos aceptados\n- INE/IFE vigente\n- Pasaporte vigente\n- Licencia de conducir\n\n## Proceso de revisión\n1. El usuario sube los documentos\n2. El sistema valida el formato\n3. Un agente revisa manualmente\n4. Se aprueba o rechaza con motivo', ARRAY['kyc', 'verificación', 'documentos'], true),
(1, 'Protocolo de manejo de quejas de retiros', 'Retiros', '# Quejas de Retiros\n\n## Pasos a seguir\n1. Verificar estado del retiro en el sistema\n2. Confirmar que la cuenta está verificada\n3. Revisar si hay bloqueos de seguridad\n4. Escalar a operador si es necesario', ARRAY['retiros', 'quejas', 'protocolo'], true)
ON CONFLICT DO NOTHING;
