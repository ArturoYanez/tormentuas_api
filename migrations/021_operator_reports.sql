-- Migration 021: Operator Reports
-- Part 7 (70%): Sistema de Reportes del Operador

-- Tabla de reportes generados
CREATE TABLE IF NOT EXISTS operator_reports (
    id BIGSERIAL PRIMARY KEY,
    report_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom', 'user', 'trade', 'alert', 'performance'
    report_name VARCHAR(255) NOT NULL,
    description TEXT,
    generated_by BIGINT REFERENCES operators(id),
    period_start TIMESTAMP,
    period_end TIMESTAMP,
    filters JSONB DEFAULT '{}',
    data JSONB DEFAULT '{}',
    summary JSONB DEFAULT '{}',
    file_url VARCHAR(500),
    file_format VARCHAR(20) DEFAULT 'json', -- 'json', 'csv', 'xlsx', 'pdf'
    file_size BIGINT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'generating', 'completed', 'failed'
    error_message TEXT,
    is_scheduled BOOLEAN DEFAULT FALSE,
    schedule_cron VARCHAR(100),
    next_run_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Plantillas de reportes
CREATE TABLE IF NOT EXISTS operator_report_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL,
    default_filters JSONB DEFAULT '{}',
    columns JSONB DEFAULT '[]',
    grouping JSONB DEFAULT '{}',
    sorting JSONB DEFAULT '{}',
    created_by BIGINT REFERENCES operators(id),
    is_system BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Reportes favoritos del operador
CREATE TABLE IF NOT EXISTS operator_report_favorites (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    template_id BIGINT NOT NULL REFERENCES operator_report_templates(id) ON DELETE CASCADE,
    custom_name VARCHAR(255),
    custom_filters JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(operator_id, template_id)
);

-- Historial de reportes programados
CREATE TABLE IF NOT EXISTS operator_scheduled_reports (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT REFERENCES operator_report_templates(id),
    operator_id BIGINT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    schedule_name VARCHAR(255) NOT NULL,
    cron_expression VARCHAR(100) NOT NULL,
    filters JSONB DEFAULT '{}',
    recipients JSONB DEFAULT '[]', -- emails o operator_ids
    delivery_method VARCHAR(50) DEFAULT 'email', -- 'email', 'download', 'both'
    file_format VARCHAR(20) DEFAULT 'xlsx',
    is_active BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    run_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Métricas de rendimiento del operador
CREATE TABLE IF NOT EXISTS operator_performance_metrics (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    actions_count INT DEFAULT 0,
    alerts_handled INT DEFAULT 0,
    alerts_resolved INT DEFAULT 0,
    avg_response_time_seconds INT,
    trades_reviewed INT DEFAULT 0,
    users_managed INT DEFAULT 0,
    escalations_made INT DEFAULT 0,
    escalations_received INT DEFAULT 0,
    login_count INT DEFAULT 0,
    active_hours DECIMAL(5,2) DEFAULT 0,
    quality_score DECIMAL(5,2),
    efficiency_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(operator_id, metric_date)
);

-- Resúmenes diarios de la plataforma
CREATE TABLE IF NOT EXISTS operator_daily_summaries (
    id BIGSERIAL PRIMARY KEY,
    summary_date DATE NOT NULL UNIQUE,
    total_users INT DEFAULT 0,
    new_users INT DEFAULT 0,
    active_users INT DEFAULT 0,
    total_trades INT DEFAULT 0,
    total_trade_volume DECIMAL(20,2) DEFAULT 0,
    winning_trades INT DEFAULT 0,
    losing_trades INT DEFAULT 0,
    platform_profit DECIMAL(20,2) DEFAULT 0,
    total_deposits DECIMAL(20,2) DEFAULT 0,
    total_withdrawals DECIMAL(20,2) DEFAULT 0,
    deposit_count INT DEFAULT 0,
    withdrawal_count INT DEFAULT 0,
    alerts_generated INT DEFAULT 0,
    alerts_resolved INT DEFAULT 0,
    support_tickets INT DEFAULT 0,
    tournaments_active INT DEFAULT 0,
    tournament_participants INT DEFAULT 0,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Resúmenes semanales
CREATE TABLE IF NOT EXISTS operator_weekly_summaries (
    id BIGSERIAL PRIMARY KEY,
    year INT NOT NULL,
    week_number INT NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    total_users INT DEFAULT 0,
    new_users INT DEFAULT 0,
    active_users INT DEFAULT 0,
    total_trades INT DEFAULT 0,
    total_trade_volume DECIMAL(20,2) DEFAULT 0,
    platform_profit DECIMAL(20,2) DEFAULT 0,
    total_deposits DECIMAL(20,2) DEFAULT 0,
    total_withdrawals DECIMAL(20,2) DEFAULT 0,
    alerts_generated INT DEFAULT 0,
    alerts_resolved INT DEFAULT 0,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(year, week_number)
);

-- Resúmenes mensuales
CREATE TABLE IF NOT EXISTS operator_monthly_summaries (
    id BIGSERIAL PRIMARY KEY,
    year INT NOT NULL,
    month INT NOT NULL,
    total_users INT DEFAULT 0,
    new_users INT DEFAULT 0,
    active_users INT DEFAULT 0,
    churned_users INT DEFAULT 0,
    total_trades INT DEFAULT 0,
    total_trade_volume DECIMAL(20,2) DEFAULT 0,
    platform_profit DECIMAL(20,2) DEFAULT 0,
    total_deposits DECIMAL(20,2) DEFAULT 0,
    total_withdrawals DECIMAL(20,2) DEFAULT 0,
    net_revenue DECIMAL(20,2) DEFAULT 0,
    avg_trade_size DECIMAL(20,2) DEFAULT 0,
    avg_trades_per_user DECIMAL(10,2) DEFAULT 0,
    top_assets JSONB DEFAULT '[]',
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(year, month)
);

-- Exportaciones de datos
CREATE TABLE IF NOT EXISTS operator_data_exports (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    export_type VARCHAR(50) NOT NULL, -- 'users', 'trades', 'alerts', 'transactions', 'reports'
    export_name VARCHAR(255) NOT NULL,
    filters JSONB DEFAULT '{}',
    columns JSONB DEFAULT '[]',
    file_format VARCHAR(20) DEFAULT 'csv',
    file_url VARCHAR(500),
    file_size BIGINT,
    record_count INT,
    status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    expires_at TIMESTAMP
);

-- Dashboards personalizados
CREATE TABLE IF NOT EXISTS operator_custom_dashboards (
    id BIGSERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    layout JSONB DEFAULT '{}',
    widgets JSONB DEFAULT '[]',
    is_default BOOLEAN DEFAULT FALSE,
    is_shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Widgets de dashboard
CREATE TABLE IF NOT EXISTS operator_dashboard_widgets (
    id BIGSERIAL PRIMARY KEY,
    dashboard_id BIGINT NOT NULL REFERENCES operator_custom_dashboards(id) ON DELETE CASCADE,
    widget_type VARCHAR(50) NOT NULL, -- 'chart', 'table', 'metric', 'list', 'map'
    title VARCHAR(255) NOT NULL,
    data_source VARCHAR(100) NOT NULL,
    config JSONB DEFAULT '{}',
    position_x INT DEFAULT 0,
    position_y INT DEFAULT 0,
    width INT DEFAULT 4,
    height INT DEFAULT 3,
    refresh_interval INT DEFAULT 60,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_operator_reports_type ON operator_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_operator_reports_status ON operator_reports(status);
CREATE INDEX IF NOT EXISTS idx_operator_reports_generated_by ON operator_reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_operator_reports_created ON operator_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_operator_report_templates_type ON operator_report_templates(report_type);
CREATE INDEX IF NOT EXISTS idx_operator_report_favorites_operator ON operator_report_favorites(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_scheduled_reports_operator ON operator_scheduled_reports(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_scheduled_reports_next_run ON operator_scheduled_reports(next_run_at);
CREATE INDEX IF NOT EXISTS idx_operator_performance_metrics_operator ON operator_performance_metrics(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_performance_metrics_date ON operator_performance_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_operator_daily_summaries_date ON operator_daily_summaries(summary_date DESC);
CREATE INDEX IF NOT EXISTS idx_operator_weekly_summaries_year_week ON operator_weekly_summaries(year, week_number);
CREATE INDEX IF NOT EXISTS idx_operator_monthly_summaries_year_month ON operator_monthly_summaries(year, month);
CREATE INDEX IF NOT EXISTS idx_operator_data_exports_operator ON operator_data_exports(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_data_exports_status ON operator_data_exports(status);
CREATE INDEX IF NOT EXISTS idx_operator_custom_dashboards_operator ON operator_custom_dashboards(operator_id);

-- Insertar plantillas de reportes del sistema
INSERT INTO operator_report_templates (name, slug, description, report_type, default_filters, columns, is_system, is_active) VALUES
('Reporte Diario de Operaciones', 'daily-operations', 'Resumen diario de todas las operaciones de la plataforma', 'daily', '{"period": "today"}', '["trades", "users", "deposits", "withdrawals", "alerts"]', TRUE, TRUE),
('Reporte de Usuarios Activos', 'active-users', 'Lista de usuarios activos con métricas de actividad', 'user', '{"status": "active"}', '["user_id", "name", "trades", "volume", "last_activity"]', TRUE, TRUE),
('Reporte de Trades Sospechosos', 'suspicious-trades', 'Trades marcados como sospechosos o con patrones inusuales', 'trade', '{"flagged": true}', '["trade_id", "user", "amount", "flag_type", "status"]', TRUE, TRUE),
('Reporte de Alertas', 'alerts-report', 'Resumen de alertas generadas y su resolución', 'alert', '{"period": "week"}', '["alert_type", "severity", "count", "resolved", "avg_time"]', TRUE, TRUE),
('Reporte de Rendimiento de Operadores', 'operator-performance', 'Métricas de rendimiento del equipo de operadores', 'performance', '{"period": "month"}', '["operator", "actions", "alerts", "response_time", "score"]', TRUE, TRUE),
('Reporte Financiero Mensual', 'monthly-financial', 'Resumen financiero mensual de la plataforma', 'monthly', '{}', '["revenue", "deposits", "withdrawals", "profit", "growth"]', TRUE, TRUE)
ON CONFLICT (slug) DO NOTHING;
