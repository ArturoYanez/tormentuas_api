-- Migration 015: Operator Tables - Base
-- Operadores, Autenticación, Sesiones, Settings, Work Schedule

-- 1. OPERATORS (Operadores)
CREATE TABLE IF NOT EXISTS operators (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    department VARCHAR(50) DEFAULT 'trading',
    position VARCHAR(100),
    status VARCHAR(20) DEFAULT 'available',
    status_message VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. OPERATOR_SESSIONS (Sesiones del Operador)
CREATE TABLE IF NOT EXISTS operator_sessions (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    device VARCHAR(200),
    browser VARCHAR(100),
    os VARCHAR(100),
    ip_address VARCHAR(45),
    location VARCHAR(100),
    token VARCHAR(500),
    is_current BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- 3. OPERATOR_SETTINGS (Configuraciones del Operador)
CREATE TABLE IF NOT EXISTS operator_settings (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE UNIQUE,
    theme VARCHAR(10) DEFAULT 'dark',
    language VARCHAR(5) DEFAULT 'es',
    timezone VARCHAR(50) DEFAULT 'Europe/Madrid',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    auto_refresh BOOLEAN DEFAULT TRUE,
    sound_alerts BOOLEAN DEFAULT FALSE,
    email_alerts BOOLEAN DEFAULT TRUE,
    font_size VARCHAR(10) DEFAULT 'medium',
    density VARCHAR(10) DEFAULT 'normal',
    do_not_disturb BOOLEAN DEFAULT FALSE,
    do_not_disturb_start TIME,
    do_not_disturb_end TIME,
    session_timeout INTEGER DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. OPERATOR_WORK_SCHEDULE (Horario de Trabajo)
CREATE TABLE IF NOT EXISTS operator_work_schedule (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_working_day BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(operator_id, day_of_week)
);

-- 5. PERMISSIONS (Catálogo de Permisos)
CREATE TABLE IF NOT EXISTS operator_permission_catalog (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. OPERATOR_ROLES (Roles de Operador)
CREATE TABLE IF NOT EXISTS operator_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. OPERATOR_ROLE_ASSIGNMENTS (Asignación de Roles)
CREATE TABLE IF NOT EXISTS operator_role_assignments (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES operator_roles(id) ON DELETE CASCADE,
    granted_by INTEGER REFERENCES operators(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(operator_id, role_id)
);

-- 8. OPERATOR_PERMISSIONS (Permisos Específicos del Operador)
CREATE TABLE IF NOT EXISTS operator_permissions (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES operator_permission_catalog(id) ON DELETE CASCADE,
    granted_by INTEGER REFERENCES operators(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(operator_id, permission_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_operators_user_id ON operators(user_id);
CREATE INDEX IF NOT EXISTS idx_operators_email ON operators(email);
CREATE INDEX IF NOT EXISTS idx_operators_status ON operators(status);
CREATE INDEX IF NOT EXISTS idx_operator_sessions_operator ON operator_sessions(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_sessions_token ON operator_sessions(token);
CREATE INDEX IF NOT EXISTS idx_operator_work_schedule_operator ON operator_work_schedule(operator_id);

-- Insertar permisos base
INSERT INTO operator_permission_catalog (name, code, category, description) VALUES
('Ver Dashboard', 'view_dashboard', 'dashboard', 'Acceso al dashboard principal'),
('Ver Usuarios', 'view_users', 'users', 'Ver lista de usuarios'),
('Editar Usuarios', 'edit_users', 'users', 'Modificar datos de usuarios'),
('Bloquear Usuarios', 'block_users', 'users', 'Bloquear/desbloquear usuarios'),
('Ver Trades', 'view_trades', 'trades', 'Ver operaciones de trading'),
('Intervenir Trades', 'intervene_trades', 'trades', 'Cancelar o modificar trades'),
('Ver Torneos', 'view_tournaments', 'tournaments', 'Ver torneos'),
('Gestionar Torneos', 'manage_tournaments', 'tournaments', 'Crear/editar/eliminar torneos'),
('Ver Alertas', 'view_alerts', 'alerts', 'Ver alertas del sistema'),
('Gestionar Alertas', 'manage_alerts', 'alerts', 'Resolver alertas'),
('Ver Reportes', 'view_reports', 'reports', 'Ver reportes'),
('Generar Reportes', 'generate_reports', 'reports', 'Generar nuevos reportes'),
('Configurar Activos', 'configure_assets', 'assets', 'Configurar pares de trading'),
('Ver Logs', 'view_logs', 'logs', 'Ver logs de actividad'),
('Gestionar Operadores', 'manage_operators', 'admin', 'Gestionar otros operadores')
ON CONFLICT (code) DO NOTHING;

-- Insertar roles base
INSERT INTO operator_roles (name, description, permissions) VALUES
('Operador Junior', 'Operador con permisos básicos', '["view_dashboard", "view_users", "view_trades", "view_tournaments", "view_alerts"]'),
('Operador Senior', 'Operador con permisos avanzados', '["view_dashboard", "view_users", "edit_users", "view_trades", "intervene_trades", "view_tournaments", "manage_tournaments", "view_alerts", "manage_alerts", "view_reports"]'),
('Supervisor', 'Supervisor de operadores', '["view_dashboard", "view_users", "edit_users", "block_users", "view_trades", "intervene_trades", "view_tournaments", "manage_tournaments", "view_alerts", "manage_alerts", "view_reports", "generate_reports", "configure_assets", "view_logs"]'),
('Administrador', 'Acceso completo', '["view_dashboard", "view_users", "edit_users", "block_users", "view_trades", "intervene_trades", "view_tournaments", "manage_tournaments", "view_alerts", "manage_alerts", "view_reports", "generate_reports", "configure_assets", "view_logs", "manage_operators"]')
ON CONFLICT (name) DO NOTHING;
