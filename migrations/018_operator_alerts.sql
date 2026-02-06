-- Migration 018: Operator Alert System Tables
-- Part 4: Alerts, notifications, alert rules, escalations

-- Operator Alerts (alertas del sistema para operadores)
CREATE TABLE IF NOT EXISTS operator_alerts (
    id BIGSERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL, -- 'trade_anomaly', 'user_risk', 'system_error', 'fraud_detected', 'limit_exceeded', 'pattern_detected'
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    source VARCHAR(50) DEFAULT 'system', -- 'system', 'manual', 'automated_rule'
    source_id BIGINT, -- ID del elemento que generó la alerta
    source_type VARCHAR(50), -- 'trade', 'user', 'tournament', 'withdrawal'
    user_id BIGINT, -- usuario relacionado (si aplica)
    assigned_to BIGINT REFERENCES operators(id),
    assigned_at TIMESTAMPTZ,
    status VARCHAR(30) DEFAULT 'new', -- 'new', 'acknowledged', 'in_progress', 'resolved', 'dismissed', 'escalated'
    acknowledged_by BIGINT REFERENCES operators(id),
    acknowledged_at TIMESTAMPTZ,
    resolved_by BIGINT REFERENCES operators(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    priority INT DEFAULT 5, -- 1-10, 1 es más urgente
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert Rules (reglas automáticas para generar alertas)
CREATE TABLE IF NOT EXISTS operator_alert_rules (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL, -- 'threshold', 'pattern', 'time_based', 'condition'
    trigger_event VARCHAR(100) NOT NULL, -- 'trade_placed', 'withdrawal_requested', 'login_failed', etc.
    conditions JSONB NOT NULL, -- condiciones para disparar la alerta
    alert_type VARCHAR(50) NOT NULL,
    alert_severity VARCHAR(20) DEFAULT 'medium',
    alert_title_template VARCHAR(255),
    alert_message_template TEXT,
    auto_assign_to BIGINT REFERENCES operators(id),
    auto_assign_department VARCHAR(50),
    cooldown_minutes INT DEFAULT 0, -- tiempo mínimo entre alertas del mismo tipo
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT REFERENCES operators(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert Escalations (escalaciones de alertas)
CREATE TABLE IF NOT EXISTS operator_alert_escalations (
    id BIGSERIAL PRIMARY KEY,
    alert_id BIGINT NOT NULL REFERENCES operator_alerts(id),
    from_operator_id BIGINT REFERENCES operators(id),
    to_operator_id BIGINT REFERENCES operators(id),
    to_department VARCHAR(50),
    escalation_level INT DEFAULT 1,
    reason TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    accepted_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert Comments (comentarios en alertas)
CREATE TABLE IF NOT EXISTS operator_alert_comments (
    id BIGSERIAL PRIMARY KEY,
    alert_id BIGINT NOT NULL REFERENCES operator_alerts(id),
    operator_id BIGINT NOT NULL REFERENCES operators(id),
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert Subscriptions (suscripciones a tipos de alertas)
CREATE TABLE IF NOT EXISTS operator_alert_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL REFERENCES operators(id),
    alert_type VARCHAR(50) NOT NULL,
    severity_filter VARCHAR(50)[], -- severidades a las que está suscrito
    notify_email BOOLEAN DEFAULT TRUE,
    notify_push BOOLEAN DEFAULT TRUE,
    notify_sms BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(operator_id, alert_type)
);

-- Alert History (historial de cambios en alertas)
CREATE TABLE IF NOT EXISTS operator_alert_history (
    id BIGSERIAL PRIMARY KEY,
    alert_id BIGINT NOT NULL REFERENCES operator_alerts(id),
    operator_id BIGINT REFERENCES operators(id),
    action VARCHAR(50) NOT NULL, -- 'created', 'acknowledged', 'assigned', 'escalated', 'resolved', 'dismissed', 'commented'
    previous_status VARCHAR(30),
    new_status VARCHAR(30),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert Templates (plantillas de alertas predefinidas)
CREATE TABLE IF NOT EXISTS operator_alert_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    title_template VARCHAR(255) NOT NULL,
    message_template TEXT NOT NULL,
    default_priority INT DEFAULT 5,
    auto_expire_hours INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT REFERENCES operators(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert Statistics (estadísticas de alertas por operador)
CREATE TABLE IF NOT EXISTS operator_alert_stats (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL REFERENCES operators(id),
    date DATE NOT NULL,
    alerts_received INT DEFAULT 0,
    alerts_acknowledged INT DEFAULT 0,
    alerts_resolved INT DEFAULT 0,
    alerts_escalated INT DEFAULT 0,
    avg_response_time_seconds INT,
    avg_resolution_time_seconds INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(operator_id, date)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_operator_alerts_type ON operator_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_operator_alerts_severity ON operator_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_operator_alerts_status ON operator_alerts(status);
CREATE INDEX IF NOT EXISTS idx_operator_alerts_assigned ON operator_alerts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_operator_alerts_user ON operator_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_operator_alerts_created ON operator_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_operator_alert_rules_active ON operator_alert_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_operator_alert_rules_event ON operator_alert_rules(trigger_event);
CREATE INDEX IF NOT EXISTS idx_operator_alert_escalations_alert ON operator_alert_escalations(alert_id);
CREATE INDEX IF NOT EXISTS idx_operator_alert_comments_alert ON operator_alert_comments(alert_id);
CREATE INDEX IF NOT EXISTS idx_operator_alert_subscriptions_operator ON operator_alert_subscriptions(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_alert_history_alert ON operator_alert_history(alert_id);
