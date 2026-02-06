-- Migration 020: Operator Activity Logs + Real-time Monitoring Tables
-- Part 6: Activity tracking, audit logs, real-time monitoring dashboards

-- ========== ACTIVITY LOGS ==========

-- Operator Activity Logs (registro de actividades de operadores)
CREATE TABLE IF NOT EXISTS operator_activity_logs (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL REFERENCES operators(id),
    activity_type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'action', 'view', 'update', 'delete', 'approve', 'reject'
    category VARCHAR(50) NOT NULL, -- 'auth', 'user_management', 'trade_control', 'tournament', 'alert', 'settings', 'chat'
    action VARCHAR(100) NOT NULL,
    description TEXT,
    target_type VARCHAR(50), -- 'user', 'trade', 'tournament', 'alert', 'asset'
    target_id BIGINT,
    previous_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(100),
    risk_level VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
    is_sensitive BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Operator Audit Trail (auditoría detallada)
CREATE TABLE IF NOT EXISTS operator_audit_trail (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL REFERENCES operators(id),
    audit_type VARCHAR(50) NOT NULL, -- 'data_access', 'data_modification', 'permission_change', 'security_event'
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    reason TEXT,
    approved_by BIGINT REFERENCES operators(id),
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Login Attempts (intentos de login)
CREATE TABLE IF NOT EXISTS operator_login_attempts (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT REFERENCES operators(id),
    email VARCHAR(255),
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100),
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    location_country VARCHAR(100),
    location_city VARCHAR(100),
    is_suspicious BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== REAL-TIME MONITORING ==========

-- Platform Metrics Snapshots (snapshots de métricas en tiempo real)
CREATE TABLE IF NOT EXISTS operator_platform_metrics (
    id BIGSERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL, -- 'users_online', 'active_trades', 'pending_withdrawals', 'system_load'
    metric_value DECIMAL(20, 4) NOT NULL,
    metric_unit VARCHAR(20),
    comparison_value DECIMAL(20, 4), -- valor anterior para comparación
    change_percentage DECIMAL(10, 4),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active Users Monitoring (usuarios activos en tiempo real)
CREATE TABLE IF NOT EXISTS operator_active_users_monitor (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    user_email VARCHAR(255),
    user_name VARCHAR(200),
    session_start TIMESTAMPTZ NOT NULL,
    last_activity TIMESTAMPTZ NOT NULL,
    current_page VARCHAR(100),
    ip_address VARCHAR(45),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    country VARCHAR(100),
    is_trading BOOLEAN DEFAULT FALSE,
    current_trade_id BIGINT,
    risk_score INT DEFAULT 0,
    flags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active Trades Monitor (trades activos en tiempo real)
CREATE TABLE IF NOT EXISTS operator_active_trades_monitor (
    id BIGSERIAL PRIMARY KEY,
    trade_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    user_name VARCHAR(200),
    symbol VARCHAR(20) NOT NULL,
    direction VARCHAR(10) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    entry_price DECIMAL(20, 8),
    current_price DECIMAL(20, 8),
    potential_payout DECIMAL(20, 8),
    expires_at TIMESTAMPTZ NOT NULL,
    time_remaining_seconds INT,
    is_demo BOOLEAN DEFAULT FALSE,
    risk_flags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Health Monitor (salud del sistema)
CREATE TABLE IF NOT EXISTS operator_system_health (
    id BIGSERIAL PRIMARY KEY,
    component VARCHAR(100) NOT NULL, -- 'api', 'database', 'websocket', 'price_feed', 'payment_gateway'
    status VARCHAR(20) NOT NULL, -- 'healthy', 'degraded', 'down', 'maintenance'
    response_time_ms INT,
    error_rate DECIMAL(5, 2),
    last_error TEXT,
    last_error_at TIMESTAMPTZ,
    uptime_percentage DECIMAL(5, 2),
    metadata JSONB DEFAULT '{}',
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time Alerts Queue (cola de alertas en tiempo real)
CREATE TABLE IF NOT EXISTS operator_realtime_alerts (
    id BIGSERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    source VARCHAR(50) NOT NULL,
    target_operators BIGINT[], -- operadores específicos o NULL para todos
    is_broadcast BOOLEAN DEFAULT FALSE,
    requires_action BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Operator Dashboard Widgets Data (datos para widgets del dashboard)
CREATE TABLE IF NOT EXISTS operator_dashboard_data (
    id BIGSERIAL PRIMARY KEY,
    widget_type VARCHAR(50) NOT NULL,
    data_key VARCHAR(100) NOT NULL,
    data_value JSONB NOT NULL,
    period VARCHAR(20), -- 'realtime', 'hourly', 'daily', 'weekly', 'monthly'
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Monitoring Thresholds (umbrales de monitoreo)
CREATE TABLE IF NOT EXISTS operator_monitoring_thresholds (
    id BIGSERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL UNIQUE,
    warning_threshold DECIMAL(20, 4),
    critical_threshold DECIMAL(20, 4),
    comparison_operator VARCHAR(10) DEFAULT '>', -- '>', '<', '>=', '<=', '='
    alert_on_breach BOOLEAN DEFAULT TRUE,
    cooldown_minutes INT DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT REFERENCES operators(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monitoring Alerts History (historial de alertas de monitoreo)
CREATE TABLE IF NOT EXISTS operator_monitoring_alerts_history (
    id BIGSERIAL PRIMARY KEY,
    threshold_id BIGINT REFERENCES operator_monitoring_thresholds(id),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(20, 4) NOT NULL,
    threshold_value DECIMAL(20, 4) NOT NULL,
    alert_level VARCHAR(20) NOT NULL, -- 'warning', 'critical'
    acknowledged_by BIGINT REFERENCES operators(id),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_operator_activity_logs_operator ON operator_activity_logs(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_activity_logs_type ON operator_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_operator_activity_logs_category ON operator_activity_logs(category);
CREATE INDEX IF NOT EXISTS idx_operator_activity_logs_created ON operator_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_operator_audit_trail_operator ON operator_audit_trail(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_audit_trail_entity ON operator_audit_trail(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_operator_login_attempts_operator ON operator_login_attempts(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_login_attempts_ip ON operator_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_operator_platform_metrics_type ON operator_platform_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_operator_platform_metrics_recorded ON operator_platform_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_operator_active_users_user ON operator_active_users_monitor(user_id);
CREATE INDEX IF NOT EXISTS idx_operator_active_trades_trade ON operator_active_trades_monitor(trade_id);
CREATE INDEX IF NOT EXISTS idx_operator_system_health_component ON operator_system_health(component);
CREATE INDEX IF NOT EXISTS idx_operator_realtime_alerts_created ON operator_realtime_alerts(created_at);
