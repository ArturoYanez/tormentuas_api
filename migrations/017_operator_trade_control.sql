-- Migration 017: Operator Trade Control Tables
-- Part 3: Trade interventions, flags, cancellations, forced results

-- Trade Interventions (intervenciones en trades activos)
CREATE TABLE IF NOT EXISTS trade_interventions (
    id BIGSERIAL PRIMARY KEY,
    trade_id BIGINT NOT NULL,
    operator_id BIGINT NOT NULL REFERENCES operators(id),
    intervention_type VARCHAR(50) NOT NULL, -- 'pause', 'resume', 'modify', 'force_close'
    original_value JSONB, -- valores originales antes de la intervención
    new_value JSONB, -- nuevos valores después de la intervención
    reason TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'applied', -- 'applied', 'reverted', 'pending_review'
    approved_by BIGINT REFERENCES operators(id),
    approved_at TIMESTAMPTZ,
    reverted_at TIMESTAMPTZ,
    reverted_by BIGINT REFERENCES operators(id),
    revert_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Trade Flags (marcas/banderas en trades sospechosos)
CREATE TABLE IF NOT EXISTS trade_flags (
    id BIGSERIAL PRIMARY KEY,
    trade_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    operator_id BIGINT NOT NULL REFERENCES operators(id),
    flag_type VARCHAR(50) NOT NULL, -- 'suspicious', 'review_needed', 'potential_fraud', 'pattern_detected', 'high_risk'
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    reason TEXT NOT NULL,
    evidence JSONB, -- evidencia adjunta
    status VARCHAR(30) DEFAULT 'active', -- 'active', 'resolved', 'dismissed', 'escalated'
    resolved_by BIGINT REFERENCES operators(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    escalated_to BIGINT REFERENCES operators(id),
    escalated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trade Cancellations (cancelaciones de trades por operadores)
CREATE TABLE IF NOT EXISTS trade_cancellations (
    id BIGSERIAL PRIMARY KEY,
    trade_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    operator_id BIGINT NOT NULL REFERENCES operators(id),
    cancellation_type VARCHAR(50) NOT NULL, -- 'user_request', 'fraud_prevention', 'system_error', 'operator_decision', 'compliance'
    original_amount DECIMAL(20, 8) NOT NULL,
    refund_amount DECIMAL(20, 8),
    refund_status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'processed', 'failed', 'partial'
    reason TEXT NOT NULL,
    user_notified BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMPTZ,
    approved_by BIGINT REFERENCES operators(id),
    approved_at TIMESTAMPTZ,
    requires_approval BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

-- Forced Trade Results (resultados forzados de trades)
CREATE TABLE IF NOT EXISTS forced_trade_results (
    id BIGSERIAL PRIMARY KEY,
    trade_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    operator_id BIGINT NOT NULL REFERENCES operators(id),
    original_result VARCHAR(20), -- 'win', 'loss', 'pending'
    forced_result VARCHAR(20) NOT NULL, -- 'win', 'loss', 'draw', 'cancelled'
    original_payout DECIMAL(20, 8),
    forced_payout DECIMAL(20, 8),
    reason TEXT NOT NULL,
    justification TEXT, -- justificación detallada
    evidence_urls TEXT[], -- URLs de evidencia
    status VARCHAR(30) DEFAULT 'applied', -- 'applied', 'pending_review', 'reverted', 'rejected'
    approved_by BIGINT REFERENCES operators(id),
    approved_at TIMESTAMPTZ,
    requires_senior_approval BOOLEAN DEFAULT FALSE,
    senior_approved_by BIGINT REFERENCES operators(id),
    senior_approved_at TIMESTAMPTZ,
    reverted_at TIMESTAMPTZ,
    reverted_by BIGINT REFERENCES operators(id),
    revert_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trade Review Queue (cola de revisión de trades)
CREATE TABLE IF NOT EXISTS trade_review_queue (
    id BIGSERIAL PRIMARY KEY,
    trade_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    queue_type VARCHAR(50) NOT NULL, -- 'auto_flagged', 'manual_review', 'escalated', 'compliance'
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    reason TEXT NOT NULL,
    auto_flag_rules TEXT[], -- reglas que dispararon el flag automático
    assigned_to BIGINT REFERENCES operators(id),
    assigned_at TIMESTAMPTZ,
    status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'in_review', 'completed', 'escalated'
    reviewed_by BIGINT REFERENCES operators(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    action_taken VARCHAR(50), -- 'approved', 'flagged', 'cancelled', 'forced_result'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    due_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

-- Trade Patterns (patrones detectados en trading)
CREATE TABLE IF NOT EXISTS trade_patterns (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    pattern_type VARCHAR(50) NOT NULL, -- 'martingale', 'arbitrage', 'bot_suspected', 'collusion', 'wash_trading'
    detected_by BIGINT REFERENCES operators(id), -- NULL si es automático
    detection_method VARCHAR(30) DEFAULT 'automatic', -- 'automatic', 'manual'
    confidence_score DECIMAL(5, 2), -- 0-100
    affected_trades BIGINT[], -- IDs de trades afectados
    pattern_data JSONB, -- datos del patrón detectado
    status VARCHAR(30) DEFAULT 'active', -- 'active', 'investigating', 'confirmed', 'dismissed'
    investigated_by BIGINT REFERENCES operators(id),
    investigation_notes TEXT,
    action_taken VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trade Limits Override (sobrescritura de límites de trading)
CREATE TABLE IF NOT EXISTS trade_limits_override (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    operator_id BIGINT NOT NULL REFERENCES operators(id),
    limit_type VARCHAR(50) NOT NULL, -- 'max_trade_amount', 'max_daily_trades', 'max_daily_volume', 'max_position'
    original_limit DECIMAL(20, 8),
    new_limit DECIMAL(20, 8) NOT NULL,
    reason TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    approved_by BIGINT REFERENCES operators(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ,
    deactivated_by BIGINT REFERENCES operators(id)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_trade_interventions_trade ON trade_interventions(trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_interventions_operator ON trade_interventions(operator_id);
CREATE INDEX IF NOT EXISTS idx_trade_interventions_status ON trade_interventions(status);
CREATE INDEX IF NOT EXISTS idx_trade_flags_trade ON trade_flags(trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_flags_user ON trade_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_flags_status ON trade_flags(status);
CREATE INDEX IF NOT EXISTS idx_trade_flags_severity ON trade_flags(severity);
CREATE INDEX IF NOT EXISTS idx_trade_cancellations_trade ON trade_cancellations(trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_cancellations_user ON trade_cancellations(user_id);
CREATE INDEX IF NOT EXISTS idx_forced_trade_results_trade ON forced_trade_results(trade_id);
CREATE INDEX IF NOT EXISTS idx_forced_trade_results_user ON forced_trade_results(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_review_queue_status ON trade_review_queue(status);
CREATE INDEX IF NOT EXISTS idx_trade_review_queue_assigned ON trade_review_queue(assigned_to);
CREATE INDEX IF NOT EXISTS idx_trade_patterns_user ON trade_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_patterns_type ON trade_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_trade_limits_override_user ON trade_limits_override(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_limits_override_active ON trade_limits_override(is_active);
