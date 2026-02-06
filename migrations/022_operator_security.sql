-- Migration 022: Operator Security
-- Part 8 (80%): Sistema de Seguridad del Operador

-- Sesiones de operadores (mejorada)
CREATE TABLE IF NOT EXISTS operator_sessions_extended (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(50),
    device_name VARCHAR(255),
    browser VARCHAR(100),
    os VARCHAR(100),
    location VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_current BOOLEAN DEFAULT FALSE,
    last_activity TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    terminated_at TIMESTAMP,
    terminated_reason VARCHAR(255)
);

-- Historial de login de operadores
CREATE TABLE IF NOT EXISTS operator_login_history (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT REFERENCES operators(id) ON DELETE SET NULL,
    email VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    location VARCHAR(255),
    country VARCHAR(100),
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(255),
    risk_score INT DEFAULT 0,
    is_suspicious BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tokens de API para operadores
CREATE TABLE IF NOT EXISTS operator_api_tokens (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    token_prefix VARCHAR(20) NOT NULL,
    permissions JSONB DEFAULT '[]',
    scopes JSONB DEFAULT '[]',
    rate_limit INT DEFAULT 1000,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP,
    last_used_ip VARCHAR(45),
    usage_count INT DEFAULT 0,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP
);

-- Configuración de seguridad del operador
CREATE TABLE IF NOT EXISTS operator_security_settings (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT UNIQUE NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    two_factor_backup_codes JSONB DEFAULT '[]',
    require_2fa_for_sensitive BOOLEAN DEFAULT TRUE,
    session_timeout_minutes INT DEFAULT 480,
    max_sessions INT DEFAULT 5,
    ip_whitelist JSONB DEFAULT '[]',
    ip_blacklist JSONB DEFAULT '[]',
    allowed_countries JSONB DEFAULT '[]',
    login_notifications BOOLEAN DEFAULT TRUE,
    suspicious_activity_alerts BOOLEAN DEFAULT TRUE,
    password_changed_at TIMESTAMP,
    password_expires_at TIMESTAMP,
    force_password_change BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bloqueos de IP
CREATE TABLE IF NOT EXISTS operator_ip_blocks (
    id BIGSERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    ip_range VARCHAR(50),
    block_type VARCHAR(20) DEFAULT 'temporary',
    reason VARCHAR(500),
    blocked_by BIGINT REFERENCES operators(id),
    failed_attempts INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Eventos de seguridad
CREATE TABLE IF NOT EXISTS operator_security_events (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT REFERENCES operators(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'info',
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by BIGINT REFERENCES operators(id),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Políticas de contraseña
CREATE TABLE IF NOT EXISTS operator_password_policies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    min_length INT DEFAULT 12,
    require_uppercase BOOLEAN DEFAULT TRUE,
    require_lowercase BOOLEAN DEFAULT TRUE,
    require_numbers BOOLEAN DEFAULT TRUE,
    require_special BOOLEAN DEFAULT TRUE,
    max_age_days INT DEFAULT 90,
    history_count INT DEFAULT 5,
    lockout_attempts INT DEFAULT 5,
    lockout_duration_minutes INT DEFAULT 30,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Historial de contraseñas
CREATE TABLE IF NOT EXISTS operator_password_history (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Dispositivos confiables
CREATE TABLE IF NOT EXISTS operator_trusted_devices (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    device_name VARCHAR(255),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    fingerprint VARCHAR(255),
    is_trusted BOOLEAN DEFAULT TRUE,
    trust_expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(operator_id, device_id)
);

-- Códigos de recuperación
CREATE TABLE IF NOT EXISTS operator_recovery_codes (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_operator_sessions_ext_operator ON operator_sessions_extended(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_sessions_ext_active ON operator_sessions_extended(is_active);
CREATE INDEX IF NOT EXISTS idx_operator_sessions_ext_token ON operator_sessions_extended(session_token);
CREATE INDEX IF NOT EXISTS idx_operator_login_history_operator ON operator_login_history(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_login_history_ip ON operator_login_history(ip_address);
CREATE INDEX IF NOT EXISTS idx_operator_login_history_created ON operator_login_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_operator_api_tokens_operator ON operator_api_tokens(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_api_tokens_prefix ON operator_api_tokens(token_prefix);
CREATE INDEX IF NOT EXISTS idx_operator_ip_blocks_ip ON operator_ip_blocks(ip_address);
CREATE INDEX IF NOT EXISTS idx_operator_ip_blocks_active ON operator_ip_blocks(is_active);
CREATE INDEX IF NOT EXISTS idx_operator_security_events_operator ON operator_security_events(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_security_events_type ON operator_security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_operator_security_events_created ON operator_security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_operator_trusted_devices_operator ON operator_trusted_devices(operator_id);

-- Insertar política de contraseña por defecto
INSERT INTO operator_password_policies (name, min_length, require_uppercase, require_lowercase, require_numbers, require_special, max_age_days, history_count, lockout_attempts, lockout_duration_minutes, is_default, is_active)
VALUES ('Política Estándar', 12, TRUE, TRUE, TRUE, TRUE, 90, 5, 5, 30, TRUE, TRUE)
ON CONFLICT DO NOTHING;
