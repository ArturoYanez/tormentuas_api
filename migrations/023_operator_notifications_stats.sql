-- Migration 023: Operator Notifications & Statistics
-- Part 9 (90%): Sistema de Notificaciones y Estadísticas

-- Notificaciones del operador
CREATE TABLE IF NOT EXISTS operator_notifications (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal',
    icon VARCHAR(50),
    action_url VARCHAR(500),
    action_label VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Preferencias de notificación del operador
CREATE TABLE IF NOT EXISTS operator_notification_preferences (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT UNIQUE NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    sound_enabled BOOLEAN DEFAULT TRUE,
    desktop_enabled BOOLEAN DEFAULT TRUE,
    alert_notifications BOOLEAN DEFAULT TRUE,
    trade_notifications BOOLEAN DEFAULT TRUE,
    user_notifications BOOLEAN DEFAULT TRUE,
    system_notifications BOOLEAN DEFAULT TRUE,
    chat_notifications BOOLEAN DEFAULT TRUE,
    report_notifications BOOLEAN DEFAULT TRUE,
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    digest_enabled BOOLEAN DEFAULT FALSE,
    digest_frequency VARCHAR(20) DEFAULT 'daily',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Estadísticas de la plataforma (snapshots)
CREATE TABLE IF NOT EXISTS operator_platform_stats (
    id BIGSERIAL PRIMARY KEY,
    stat_date DATE NOT NULL,
    stat_hour INT,
    total_users INT DEFAULT 0,
    active_users INT DEFAULT 0,
    new_users INT DEFAULT 0,
    verified_users INT DEFAULT 0,
    total_trades INT DEFAULT 0,
    active_trades INT DEFAULT 0,
    completed_trades INT DEFAULT 0,
    winning_trades INT DEFAULT 0,
    losing_trades INT DEFAULT 0,
    total_volume DECIMAL(20,2) DEFAULT 0,
    total_deposits DECIMAL(20,2) DEFAULT 0,
    total_withdrawals DECIMAL(20,2) DEFAULT 0,
    pending_withdrawals DECIMAL(20,2) DEFAULT 0,
    platform_profit DECIMAL(20,2) DEFAULT 0,
    active_tournaments INT DEFAULT 0,
    tournament_participants INT DEFAULT 0,
    open_tickets INT DEFAULT 0,
    active_alerts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(stat_date, stat_hour)
);

-- KPIs del operador
CREATE TABLE IF NOT EXISTS operator_kpis (
    id BIGSERIAL PRIMARY KEY,
    kpi_name VARCHAR(100) NOT NULL,
    kpi_category VARCHAR(50) NOT NULL,
    current_value DECIMAL(20,4),
    previous_value DECIMAL(20,4),
    target_value DECIMAL(20,4),
    unit VARCHAR(20),
    trend VARCHAR(20),
    change_percentage DECIMAL(10,2),
    period_type VARCHAR(20) DEFAULT 'daily',
    period_start DATE,
    period_end DATE,
    is_positive_good BOOLEAN DEFAULT TRUE,
    threshold_warning DECIMAL(20,4),
    threshold_critical DECIMAL(20,4),
    metadata JSONB DEFAULT '{}',
    calculated_at TIMESTAMP DEFAULT NOW()
);

-- Estadísticas por activo
CREATE TABLE IF NOT EXISTS operator_asset_stats (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(50) NOT NULL,
    stat_date DATE NOT NULL,
    total_trades INT DEFAULT 0,
    total_volume DECIMAL(20,2) DEFAULT 0,
    winning_trades INT DEFAULT 0,
    losing_trades INT DEFAULT 0,
    avg_trade_size DECIMAL(20,2) DEFAULT 0,
    avg_duration_seconds INT DEFAULT 0,
    unique_traders INT DEFAULT 0,
    platform_profit DECIMAL(20,2) DEFAULT 0,
    payout_percentage DECIMAL(5,2),
    volatility_score DECIMAL(5,2),
    popularity_rank INT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(symbol, stat_date)
);

-- Estadísticas por usuario (agregadas)
CREATE TABLE IF NOT EXISTS operator_user_stats_aggregate (
    id BIGSERIAL PRIMARY KEY,
    stat_date DATE NOT NULL,
    total_users INT DEFAULT 0,
    users_by_country JSONB DEFAULT '{}',
    users_by_status JSONB DEFAULT '{}',
    users_by_verification JSONB DEFAULT '{}',
    users_by_risk_level JSONB DEFAULT '{}',
    avg_balance DECIMAL(20,2) DEFAULT 0,
    median_balance DECIMAL(20,2) DEFAULT 0,
    total_balance DECIMAL(20,2) DEFAULT 0,
    avg_trades_per_user DECIMAL(10,2) DEFAULT 0,
    avg_volume_per_user DECIMAL(20,2) DEFAULT 0,
    retention_rate_7d DECIMAL(5,2),
    retention_rate_30d DECIMAL(5,2),
    churn_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(stat_date)
);

-- Estadísticas de trading agregadas
CREATE TABLE IF NOT EXISTS operator_trading_stats_aggregate (
    id BIGSERIAL PRIMARY KEY,
    stat_date DATE NOT NULL,
    stat_hour INT,
    total_trades INT DEFAULT 0,
    buy_trades INT DEFAULT 0,
    sell_trades INT DEFAULT 0,
    total_volume DECIMAL(20,2) DEFAULT 0,
    avg_trade_size DECIMAL(20,2) DEFAULT 0,
    max_trade_size DECIMAL(20,2) DEFAULT 0,
    min_trade_size DECIMAL(20,2) DEFAULT 0,
    winning_trades INT DEFAULT 0,
    losing_trades INT DEFAULT 0,
    draw_trades INT DEFAULT 0,
    win_rate DECIMAL(5,2),
    total_payouts DECIMAL(20,2) DEFAULT 0,
    platform_profit DECIMAL(20,2) DEFAULT 0,
    avg_duration_seconds INT DEFAULT 0,
    most_traded_asset VARCHAR(50),
    trades_by_asset JSONB DEFAULT '{}',
    trades_by_duration JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(stat_date, stat_hour)
);

-- Estadísticas financieras agregadas
CREATE TABLE IF NOT EXISTS operator_financial_stats_aggregate (
    id BIGSERIAL PRIMARY KEY,
    stat_date DATE NOT NULL,
    total_deposits DECIMAL(20,2) DEFAULT 0,
    deposit_count INT DEFAULT 0,
    avg_deposit DECIMAL(20,2) DEFAULT 0,
    total_withdrawals DECIMAL(20,2) DEFAULT 0,
    withdrawal_count INT DEFAULT 0,
    avg_withdrawal DECIMAL(20,2) DEFAULT 0,
    pending_withdrawals DECIMAL(20,2) DEFAULT 0,
    net_deposits DECIMAL(20,2) DEFAULT 0,
    deposits_by_method JSONB DEFAULT '{}',
    withdrawals_by_method JSONB DEFAULT '{}',
    deposits_by_currency JSONB DEFAULT '{}',
    gross_revenue DECIMAL(20,2) DEFAULT 0,
    net_revenue DECIMAL(20,2) DEFAULT 0,
    bonuses_issued DECIMAL(20,2) DEFAULT 0,
    bonuses_used DECIMAL(20,2) DEFAULT 0,
    commissions_paid DECIMAL(20,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(stat_date)
);

-- Comparativas de rendimiento
CREATE TABLE IF NOT EXISTS operator_performance_comparisons (
    id BIGSERIAL PRIMARY KEY,
    comparison_type VARCHAR(50) NOT NULL,
    period_type VARCHAR(20) NOT NULL,
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    previous_period_start DATE,
    previous_period_end DATE,
    metric_name VARCHAR(100) NOT NULL,
    current_value DECIMAL(20,4),
    previous_value DECIMAL(20,4),
    change_absolute DECIMAL(20,4),
    change_percentage DECIMAL(10,2),
    trend VARCHAR(20),
    calculated_at TIMESTAMP DEFAULT NOW()
);

-- Alertas de estadísticas
CREATE TABLE IF NOT EXISTS operator_stat_alerts (
    id BIGSERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    threshold_type VARCHAR(20) NOT NULL,
    threshold_value DECIMAL(20,4) NOT NULL,
    current_value DECIMAL(20,4),
    severity VARCHAR(20) DEFAULT 'warning',
    message TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    triggered_at TIMESTAMP DEFAULT NOW(),
    acknowledged_at TIMESTAMP,
    acknowledged_by BIGINT REFERENCES operators(id),
    resolved_at TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_operator_notifications_operator ON operator_notifications(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_notifications_read ON operator_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_operator_notifications_type ON operator_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_operator_notifications_created ON operator_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_operator_platform_stats_date ON operator_platform_stats(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_operator_kpis_name ON operator_kpis(kpi_name);
CREATE INDEX IF NOT EXISTS idx_operator_kpis_category ON operator_kpis(kpi_category);
CREATE INDEX IF NOT EXISTS idx_operator_asset_stats_symbol ON operator_asset_stats(symbol);
CREATE INDEX IF NOT EXISTS idx_operator_asset_stats_date ON operator_asset_stats(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_operator_user_stats_date ON operator_user_stats_aggregate(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_operator_trading_stats_date ON operator_trading_stats_aggregate(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_operator_financial_stats_date ON operator_financial_stats_aggregate(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_operator_stat_alerts_active ON operator_stat_alerts(is_active);
