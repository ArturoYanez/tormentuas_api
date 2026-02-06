-- Migration 014: Accountant Tables V3
-- Auditoría, Alertas, Seguridad, Métricas, Gastos

-- ========== 10. AUDITORÍA FINANCIERA ==========
CREATE TABLE IF NOT EXISTS accountant_audit_logs (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id),
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    details TEXT,
    old_values JSONB,
    new_values JSONB,
    amount DECIMAL(15,2),
    ip_address VARCHAR(45),
    user_agent TEXT,
    risk_level VARCHAR(20) DEFAULT 'low',
    reviewed BOOLEAN DEFAULT false,
    reviewed_by INTEGER REFERENCES accountants(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_reviews (
    id SERIAL PRIMARY KEY,
    review_type VARCHAR(50) NOT NULL,
    review_period_start DATE,
    review_period_end DATE,
    reviewer_id INTEGER REFERENCES accountants(id),
    findings TEXT,
    recommendations TEXT,
    risk_assessment VARCHAR(50),
    status VARCHAR(20) DEFAULT 'in_progress',
    completed_at TIMESTAMP,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_checks (
    id SERIAL PRIMARY KEY,
    check_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    check_date DATE NOT NULL,
    result VARCHAR(20) NOT NULL,
    score INTEGER,
    findings JSONB DEFAULT '[]',
    performed_by INTEGER REFERENCES accountants(id),
    notes TEXT,
    next_check_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== 11. ALERTAS SOSPECHOSAS ==========
CREATE TABLE IF NOT EXISTS suspicious_alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    amount DECIMAL(15,2),
    reason TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    related_transaction_id INTEGER,
    related_transaction_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    reviewed BOOLEAN DEFAULT false,
    reviewed_by INTEGER REFERENCES accountants(id),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    action_taken VARCHAR(100),
    escalated BOOLEAN DEFAULT false,
    escalated_to INTEGER REFERENCES users(id),
    escalated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suspicious_patterns (
    id SERIAL PRIMARY KEY,
    pattern_name VARCHAR(200) NOT NULL,
    pattern_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    detection_rules JSONB NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    auto_flag BOOLEAN DEFAULT true,
    auto_block BOOLEAN DEFAULT false,
    notification_required BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_risk_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    risk_score INTEGER DEFAULT 0,
    risk_level VARCHAR(20) DEFAULT 'low',
    total_alerts INTEGER DEFAULT 0,
    unresolved_alerts INTEGER DEFAULT 0,
    last_alert_at TIMESTAMP,
    flags JSONB DEFAULT '[]',
    notes TEXT,
    last_review_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES accountants(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fraud_investigations (
    id SERIAL PRIMARY KEY,
    case_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    alert_ids INTEGER[],
    investigation_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_to INTEGER REFERENCES accountants(id),
    findings TEXT,
    evidence JSONB DEFAULT '[]',
    conclusion TEXT,
    action_taken VARCHAR(100),
    amount_involved DECIMAL(15,2),
    opened_at TIMESTAMP DEFAULT NOW(),
    closed_at TIMESTAMP,
    closed_by INTEGER REFERENCES accountants(id)
);

-- ========== 12. CONFIGURACIÓN Y SEGURIDAD ==========
CREATE TABLE IF NOT EXISTS accountant_settings (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) UNIQUE,
    timezone VARCHAR(100) DEFAULT 'America/New_York',
    language VARCHAR(10) DEFAULT 'es',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    currency_format VARCHAR(20) DEFAULT 'USD',
    theme VARCHAR(20) DEFAULT 'dark',
    sidebar_collapsed BOOLEAN DEFAULT false,
    dashboard_layout JSONB DEFAULT '{}',
    default_view VARCHAR(50) DEFAULT 'dashboard',
    items_per_page INTEGER DEFAULT 25,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accountant_notification_settings (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) UNIQUE,
    email_new_withdrawal BOOLEAN DEFAULT true,
    email_large_transaction BOOLEAN DEFAULT true,
    email_daily_report BOOLEAN DEFAULT true,
    push_new_withdrawal BOOLEAN DEFAULT true,
    push_urgent BOOLEAN DEFAULT true,
    push_suspicious_alert BOOLEAN DEFAULT true,
    sound_enabled BOOLEAN DEFAULT true,
    large_transaction_threshold DECIMAL(15,2) DEFAULT 1000.00,
    urgent_withdrawal_threshold DECIMAL(15,2) DEFAULT 5000.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accountant_sessions (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id),
    session_token VARCHAR(255) UNIQUE,
    device VARCHAR(200),
    browser VARCHAR(200),
    os VARCHAR(100),
    ip_address VARCHAR(45),
    location VARCHAR(200),
    is_current BOOLEAN DEFAULT false,
    last_active TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accountant_login_history (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id),
    login_at TIMESTAMP DEFAULT NOW(),
    ip_address VARCHAR(45),
    device VARCHAR(200),
    browser VARCHAR(200),
    location VARCHAR(200),
    status VARCHAR(20) NOT NULL,
    failure_reason VARCHAR(200),
    user_agent TEXT
);

CREATE TABLE IF NOT EXISTS accountant_activity_logs (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id),
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    ip_address VARCHAR(45),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== 13. MÉTRICAS Y ESTADÍSTICAS ==========
CREATE TABLE IF NOT EXISTS platform_metrics (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    metric_hour INTEGER,
    total_balance DECIMAL(15,2) DEFAULT 0,
    total_deposits_24h DECIMAL(15,2) DEFAULT 0,
    total_withdrawals_24h DECIMAL(15,2) DEFAULT 0,
    pending_withdrawals DECIMAL(15,2) DEFAULT 0,
    pending_deposits DECIMAL(15,2) DEFAULT 0,
    active_users_24h INTEGER DEFAULT 0,
    trading_volume_24h DECIMAL(15,2) DEFAULT 0,
    total_commissions_24h DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(metric_date, metric_hour)
);

CREATE TABLE IF NOT EXISTS financial_kpis (
    id SERIAL PRIMARY KEY,
    kpi_date DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL,
    revenue DECIMAL(15,2) DEFAULT 0,
    expenses DECIMAL(15,2) DEFAULT 0,
    gross_margin DECIMAL(5,2),
    net_margin DECIMAL(5,2),
    deposit_to_withdrawal_ratio DECIMAL(5,2),
    average_transaction_value DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(kpi_date, period_type)
);

CREATE TABLE IF NOT EXISTS transaction_statistics (
    id SERIAL PRIMARY KEY,
    stat_date DATE NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    total_count INTEGER DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    average_amount DECIMAL(15,2) DEFAULT 0,
    min_amount DECIMAL(15,2),
    max_amount DECIMAL(15,2),
    approved_count INTEGER DEFAULT 0,
    rejected_count INTEGER DEFAULT 0,
    pending_count INTEGER DEFAULT 0,
    average_processing_time INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(stat_date, transaction_type)
);

-- ========== 14. GASTOS OPERATIVOS ==========
CREATE TABLE IF NOT EXISTS expense_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    parent_id INTEGER REFERENCES expense_categories(id),
    description TEXT,
    budget_monthly DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operating_expenses (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES expense_categories(id),
    expense_type VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    expense_date DATE NOT NULL,
    vendor_id INTEGER REFERENCES vendors(id),
    invoice_id INTEGER REFERENCES invoices(id),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    is_recurring BOOLEAN DEFAULT false,
    recurrence_period VARCHAR(20),
    approved_by INTEGER REFERENCES accountants(id),
    approved_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    attachments JSONB DEFAULT '[]',
    created_by INTEGER REFERENCES accountants(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expense_budgets (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES expense_categories(id),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    budgeted_amount DECIMAL(15,2) NOT NULL,
    actual_amount DECIMAL(15,2) DEFAULT 0,
    variance DECIMAL(15,2) DEFAULT 0,
    variance_percentage DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(category_id, year, month)
);

-- ========== 15. PROVEEDORES DE PAGO ==========
CREATE TABLE IF NOT EXISTS payment_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    provider_type VARCHAR(50) NOT NULL,
    supported_currencies TEXT[],
    supported_networks TEXT[],
    fee_structure JSONB,
    min_transaction DECIMAL(15,2),
    max_transaction DECIMAL(15,2),
    daily_limit DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active',
    last_health_check TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_provider_balances (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES payment_providers(id),
    currency VARCHAR(10) NOT NULL,
    available_balance DECIMAL(15,2) DEFAULT 0,
    pending_balance DECIMAL(15,2) DEFAULT 0,
    reserved_balance DECIMAL(15,2) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider_id, currency)
);

-- ========== 16. NOTIFICACIONES ==========
CREATE TABLE IF NOT EXISTS accountant_notifications (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id),
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    priority VARCHAR(20) DEFAULT 'normal',
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER,
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== 17. TAREAS ==========
CREATE TABLE IF NOT EXISTS accountant_tasks (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id),
    task_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    due_date TIMESTAMP,
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER,
    assigned_by INTEGER REFERENCES users(id),
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ========== 18. FLUJO DE CAJA ==========
CREATE TABLE IF NOT EXISTS cash_flow_records (
    id SERIAL PRIMARY KEY,
    record_date DATE NOT NULL,
    record_type VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    inflow DECIMAL(15,2) DEFAULT 0,
    outflow DECIMAL(15,2) DEFAULT 0,
    net_flow DECIMAL(15,2) DEFAULT 0,
    running_balance DECIMAL(15,2),
    reference_type VARCHAR(50),
    reference_id INTEGER,
    recorded_by INTEGER REFERENCES accountants(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON deposit_requests(status);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_user ON deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_accountant_audit_logs_accountant ON accountant_audit_logs(accountant_id);
CREATE INDEX IF NOT EXISTS idx_accountant_audit_logs_date ON accountant_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_reconciliations_status ON reconciliations(status);
CREATE INDEX IF NOT EXISTS idx_suspicious_alerts_status ON suspicious_alerts(status);
CREATE INDEX IF NOT EXISTS idx_suspicious_alerts_user ON suspicious_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_accountant_notifications_read ON accountant_notifications(accountant_id, is_read);
CREATE INDEX IF NOT EXISTS idx_accountant_tasks_status ON accountant_tasks(accountant_id, status);

-- Insert default expense categories
INSERT INTO expense_categories (name, code, description) VALUES
    ('Operaciones', 'operations', 'Gastos operativos generales'),
    ('Tecnología', 'technology', 'Software, servidores, licencias'),
    ('Marketing', 'marketing', 'Publicidad y promociones'),
    ('Personal', 'personnel', 'Salarios y beneficios'),
    ('Legal', 'legal', 'Servicios legales y cumplimiento'),
    ('Bancarios', 'banking', 'Comisiones bancarias y financieras')
ON CONFLICT (code) DO NOTHING;

-- Insert default commission types
INSERT INTO commission_types (name, code, description, percentage, applies_to) VALUES
    ('Comisión Trading', 'trading_fee', 'Comisión por operaciones de trading', 0.001, 'trades'),
    ('Comisión Retiro', 'withdrawal_fee', 'Comisión por retiros', 0.005, 'withdrawals'),
    ('Comisión Depósito', 'deposit_fee', 'Comisión por depósitos', 0.001, 'deposits'),
    ('Spread', 'spread', 'Diferencial de precios', 0.002, 'trades')
ON CONFLICT (code) DO NOTHING;

-- Insert default suspicious patterns
INSERT INTO suspicious_patterns (pattern_name, pattern_code, description, detection_rules, severity) VALUES
    ('Retiro Grande', 'large_withdrawal', 'Retiro superior al límite normal', '{"amount_threshold": 5000}', 'high'),
    ('Múltiples Retiros', 'multiple_withdrawals', 'Varios retiros en poco tiempo', '{"count_threshold": 3, "time_window_hours": 24}', 'medium'),
    ('Nuevo Usuario Retiro', 'new_user_withdrawal', 'Usuario nuevo solicitando retiro', '{"account_age_days": 7}', 'medium'),
    ('Cambio de Wallet', 'wallet_change', 'Cambio de dirección de retiro', '{"recent_change_hours": 24}', 'low')
ON CONFLICT (pattern_code) DO NOTHING;
