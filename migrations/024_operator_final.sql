-- Migration 024: Operator Final
-- Part 10 (100%): Funcionalidades Finales del Operador

-- Búsqueda global - historial de búsquedas
CREATE TABLE IF NOT EXISTS operator_search_history (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    search_query VARCHAR(500) NOT NULL,
    search_type VARCHAR(50) DEFAULT 'global',
    results_count INT DEFAULT 0,
    selected_result_type VARCHAR(50),
    selected_result_id BIGINT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Búsquedas guardadas
CREATE TABLE IF NOT EXISTS operator_saved_searches (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    search_type VARCHAR(50) NOT NULL,
    query VARCHAR(500) NOT NULL,
    filters JSONB DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT FALSE,
    use_count INT DEFAULT 0,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Accesos directos / Favoritos del operador
CREATE TABLE IF NOT EXISTS operator_quick_access (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL,
    item_id BIGINT,
    item_name VARCHAR(255) NOT NULL,
    item_url VARCHAR(500),
    icon VARCHAR(50),
    color VARCHAR(20),
    display_order INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(operator_id, item_type, item_id)
);

-- Webhooks del operador
CREATE TABLE IF NOT EXISTS operator_webhooks (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    secret VARCHAR(255),
    events JSONB DEFAULT '[]',
    headers JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    retry_count INT DEFAULT 3,
    timeout_seconds INT DEFAULT 30,
    last_triggered_at TIMESTAMP,
    last_status VARCHAR(20),
    last_response_code INT,
    success_count INT DEFAULT 0,
    failure_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Historial de webhooks
CREATE TABLE IF NOT EXISTS operator_webhook_logs (
    id BIGSERIAL PRIMARY KEY,
    webhook_id BIGINT NOT NULL REFERENCES operator_webhooks(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB,
    response_code INT,
    response_body TEXT,
    duration_ms INT,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    retry_attempt INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Historial de cambios de configuración
CREATE TABLE IF NOT EXISTS operator_config_changes (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT REFERENCES operators(id) ON DELETE SET NULL,
    config_type VARCHAR(50) NOT NULL,
    config_key VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_reason VARCHAR(500),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Notas rápidas del operador
CREATE TABLE IF NOT EXISTS operator_quick_notes (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    color VARCHAR(20) DEFAULT 'yellow',
    is_pinned BOOLEAN DEFAULT FALSE,
    reminder_at TIMESTAMP,
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tareas pendientes del operador
CREATE TABLE IF NOT EXISTS operator_tasks (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'pending',
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    related_type VARCHAR(50),
    related_id BIGINT,
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Atajos de teclado personalizados
CREATE TABLE IF NOT EXISTS operator_keyboard_shortcuts (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    shortcut VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(operator_id, action)
);

-- Plantillas de respuesta rápida
CREATE TABLE IF NOT EXISTS operator_quick_responses (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT REFERENCES operators(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    shortcut VARCHAR(50),
    content TEXT NOT NULL,
    category VARCHAR(50),
    variables JSONB DEFAULT '[]',
    is_global BOOLEAN DEFAULT FALSE,
    use_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_operator_search_history_operator ON operator_search_history(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_search_history_created ON operator_search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_operator_saved_searches_operator ON operator_saved_searches(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_quick_access_operator ON operator_quick_access(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_webhooks_operator ON operator_webhooks(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_webhooks_active ON operator_webhooks(is_active);
CREATE INDEX IF NOT EXISTS idx_operator_webhook_logs_webhook ON operator_webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_operator_webhook_logs_created ON operator_webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_operator_config_changes_operator ON operator_config_changes(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_config_changes_created ON operator_config_changes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_operator_quick_notes_operator ON operator_quick_notes(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_tasks_operator ON operator_tasks(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_tasks_status ON operator_tasks(status);
CREATE INDEX IF NOT EXISTS idx_operator_quick_responses_operator ON operator_quick_responses(operator_id);

-- Insertar atajos de teclado por defecto
INSERT INTO operator_keyboard_shortcuts (operator_id, action, shortcut) VALUES
(1, 'search', 'Ctrl+K'),
(1, 'new_alert', 'Ctrl+Shift+A'),
(1, 'dashboard', 'Ctrl+D'),
(1, 'notifications', 'Ctrl+N'),
(1, 'settings', 'Ctrl+,')
ON CONFLICT DO NOTHING;
