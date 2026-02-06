-- =====================================================
-- MIGRACIÓN COMPLETA - PLATAFORMA DE TRADING
-- Incluye tablas para: Cliente, Operador, Soporte, Contador
-- =====================================================

-- =====================================================
-- SECCIÓN 1: USUARIOS Y AUTENTICACIÓN
-- =====================================================

-- Tabla de perfiles de usuario extendida
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    phone VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    postal_code VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    avatar_url VARCHAR(500),
    bio TEXT,
    timezone VARCHAR(100) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'es',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sesiones de usuario
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device VARCHAR(200),
    browser VARCHAR(200),
    os VARCHAR(100),
    ip_address INET,
    location VARCHAR(200),
    is_current BOOLEAN DEFAULT false,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Historial de login
CREATE TABLE IF NOT EXISTS login_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    device VARCHAR(200),
    browser VARCHAR(200),
    os VARCHAR(100),
    location VARCHAR(200),
    status VARCHAR(20) NOT NULL,
    failure_reason VARCHAR(200),
    user_agent TEXT
);

-- Dispositivos de confianza
CREATE TABLE IF NOT EXISTS trusted_devices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    device_name VARCHAR(200) NOT NULL,
    device_type VARCHAR(50),
    device_fingerprint VARCHAR(255),
    last_used TIMESTAMP,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Autenticación de dos factores
CREATE TABLE IF NOT EXISTS two_factor_auth (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    is_enabled BOOLEAN DEFAULT false,
    method VARCHAR(20) DEFAULT 'app',
    secret_key VARCHAR(255),
    backup_codes TEXT[],
    phone_number VARCHAR(50),
    last_used TIMESTAMP,
    setup_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- SECCIÓN 2: KYC Y VERIFICACIÓN
-- =====================================================

-- Documentos KYC
CREATE TABLE IF NOT EXISTS kyc_documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    document_type VARCHAR(50) NOT NULL,
    document_number VARCHAR(100),
    issuing_country VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    front_image_url VARCHAR(500),
    back_image_url VARCHAR(500),
    selfie_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending',
    rejection_reason TEXT,
    verified_by INTEGER REFERENCES users(id),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Niveles de verificación
CREATE TABLE IF NOT EXISTS verification_levels (
    id SERIAL PRIMARY KEY,
    level_name VARCHAR(50) NOT NULL,
    level_number INTEGER UNIQUE NOT NULL,
    daily_withdrawal_limit DECIMAL(15,2),
    monthly_withdrawal_limit DECIMAL(15,2),
    requirements JSONB,
    is_active BOOLEAN DEFAULT true
);

-- Estado de verificación del usuario
CREATE TABLE IF NOT EXISTS user_verification_status (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    current_level INTEGER DEFAULT 0,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    identity_verified BOOLEAN DEFAULT false,
    address_verified BOOLEAN DEFAULT false,
    last_verification_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SECCIÓN 3: BILLETERA Y FINANZAS
-- =====================================================

-- Billeteras de usuario
CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    wallet_type VARCHAR(20) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    balance DECIMAL(15,2) DEFAULT 0,
    available_balance DECIMAL(15,2) DEFAULT 0,
    locked_balance DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, wallet_type, currency)
);

-- Transacciones de billetera
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id SERIAL PRIMARY KEY,
    wallet_id INTEGER REFERENCES wallets(id),
    user_id INTEGER REFERENCES users(id),
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    fee DECIMAL(15,4) DEFAULT 0,
    balance_before DECIMAL(15,2),
    balance_after DECIMAL(15,2),
    reference_type VARCHAR(50),
    reference_id INTEGER,
    status VARCHAR(20) DEFAULT 'completed',
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Solicitudes de depósito
CREATE TABLE IF NOT EXISTS deposit_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    method VARCHAR(50) NOT NULL,
    network VARCHAR(50),
    tx_hash VARCHAR(255),
    from_address VARCHAR(255),
    to_address VARCHAR(255),
    confirmations INTEGER DEFAULT 0,
    required_confirmations INTEGER DEFAULT 3,
    status VARCHAR(20) DEFAULT 'pending',
    confirmed_by INTEGER REFERENCES users(id),
    confirmed_at TIMESTAMP,
    rejection_reason TEXT,
    credited_amount DECIMAL(15,2),
    fee_amount DECIMAL(15,4) DEFAULT 0,
    exchange_rate DECIMAL(15,8),
    notes TEXT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Solicitudes de retiro
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    method VARCHAR(50) NOT NULL,
    network VARCHAR(50),
    wallet_address VARCHAR(255),
    bank_account_id INTEGER,
    user_balance_at_request DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'normal',
    risk_score INTEGER DEFAULT 0,
    risk_flags JSONB DEFAULT '[]',
    processed_by INTEGER REFERENCES users(id),
    processed_at TIMESTAMP,
    rejection_reason TEXT,
    tx_hash VARCHAR(255),
    fee_amount DECIMAL(15,4) DEFAULT 0,
    net_amount DECIMAL(15,2),
    notes TEXT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Métodos de pago del usuario
CREATE TABLE IF NOT EXISTS user_payment_methods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    method_type VARCHAR(50) NOT NULL,
    provider VARCHAR(100),
    account_number VARCHAR(255),
    account_name VARCHAR(200),
    bank_name VARCHAR(200),
    bank_code VARCHAR(50),
    swift_code VARCHAR(20),
    wallet_address VARCHAR(255),
    network VARCHAR(50),
    is_verified BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- SECCIÓN 4: BONOS Y PROMOCIONES
-- =====================================================

-- Tipos de bonos
CREATE TABLE IF NOT EXISTS bonus_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    bonus_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2),
    percentage DECIMAL(5,2),
    min_deposit DECIMAL(15,2),
    max_bonus DECIMAL(15,2),
    wagering_requirement DECIMAL(5,2) DEFAULT 1,
    validity_days INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bonos de usuario
CREATE TABLE IF NOT EXISTS user_bonuses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    bonus_type_id INTEGER REFERENCES bonus_types(id),
    amount DECIMAL(15,2) NOT NULL,
    wagering_requirement DECIMAL(15,2),
    wagered_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    expires_at TIMESTAMP,
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancel_reason TEXT
);

-- Códigos promocionales
CREATE TABLE IF NOT EXISTS promo_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    bonus_type_id INTEGER REFERENCES bonus_types(id),
    discount_type VARCHAR(20),
    discount_value DECIMAL(15,2),
    min_amount DECIMAL(15,2),
    max_uses INTEGER,
    uses_count INTEGER DEFAULT 0,
    max_uses_per_user INTEGER DEFAULT 1,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Uso de códigos promocionales
CREATE TABLE IF NOT EXISTS promo_code_uses (
    id SERIAL PRIMARY KEY,
    promo_code_id INTEGER REFERENCES promo_codes(id),
    user_id INTEGER REFERENCES users(id),
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount_applied DECIMAL(15,2),
    UNIQUE(promo_code_id, user_id)
);

-- =====================================================
-- SECCIÓN 5: SISTEMA DE REFERIDOS
-- =====================================================

-- Códigos de referido
CREATE TABLE IF NOT EXISTS referral_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    code VARCHAR(20) UNIQUE NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 10,
    total_referrals INTEGER DEFAULT 0,
    total_earnings DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referidos
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referrer_id INTEGER REFERENCES users(id),
    referred_id INTEGER REFERENCES users(id) UNIQUE,
    referral_code_id INTEGER REFERENCES referral_codes(id),
    status VARCHAR(20) DEFAULT 'pending',
    qualified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comisiones de referidos
CREATE TABLE IF NOT EXISTS referral_commissions (
    id SERIAL PRIMARY KEY,
    referral_id INTEGER REFERENCES referrals(id),
    referrer_id INTEGER REFERENCES users(id),
    source_type VARCHAR(50) NOT NULL,
    source_id INTEGER,
    amount DECIMAL(15,2) NOT NULL,
    commission_rate DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'pending',
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SECCIÓN 6: NOTIFICACIONES
-- =====================================================

-- Notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    priority VARCHAR(20) DEFAULT 'normal',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Configuración de notificaciones
CREATE TABLE IF NOT EXISTS notification_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    email_trading BOOLEAN DEFAULT true,
    email_deposits BOOLEAN DEFAULT true,
    email_withdrawals BOOLEAN DEFAULT true,
    email_promotions BOOLEAN DEFAULT true,
    email_security BOOLEAN DEFAULT true,
    push_trading BOOLEAN DEFAULT true,
    push_deposits BOOLEAN DEFAULT true,
    push_withdrawals BOOLEAN DEFAULT true,
    push_promotions BOOLEAN DEFAULT false,
    sms_security BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Push tokens
CREATE TABLE IF NOT EXISTS push_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token VARCHAR(500) NOT NULL,
    device_type VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, token)
);


-- =====================================================
-- SECCIÓN 7: SOPORTE Y TICKETS
-- =====================================================

-- Categorías de tickets
CREATE TABLE IF NOT EXISTS ticket_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    priority_default VARCHAR(20) DEFAULT 'medium',
    sla_hours INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT true
);

-- Tickets de soporte
CREATE TABLE IF NOT EXISTS support_tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    category_id INTEGER REFERENCES ticket_categories(id),
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open',
    assigned_to INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP,
    first_response_at TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,
    satisfaction_rating INTEGER,
    satisfaction_comment TEXT,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mensajes de tickets
CREATE TABLE IF NOT EXISTS ticket_messages (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id),
    sender_id INTEGER REFERENCES users(id),
    sender_type VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Archivos adjuntos de tickets
CREATE TABLE IF NOT EXISTS ticket_attachments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id),
    message_id INTEGER REFERENCES ticket_messages(id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    file_url VARCHAR(500) NOT NULL,
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat en vivo
CREATE TABLE IF NOT EXISTS live_chats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    agent_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'waiting',
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    rating INTEGER,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mensajes de chat en vivo
CREATE TABLE IF NOT EXISTS live_chat_messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES live_chats(id),
    sender_id INTEGER REFERENCES users(id),
    sender_type VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    attachments JSONB DEFAULT '[]',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FAQ
CREATE TABLE IF NOT EXISTS faq_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS faq_articles (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES faq_categories(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SECCIÓN 8: ACADEMIA Y EDUCACIÓN
-- =====================================================

-- Cursos
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    difficulty VARCHAR(20) DEFAULT 'beginner',
    duration_minutes INTEGER,
    is_premium BOOLEAN DEFAULT false,
    price DECIMAL(15,2) DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lecciones
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url VARCHAR(500),
    duration_minutes INTEGER,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Progreso del usuario en cursos
CREATE TABLE IF NOT EXISTS user_course_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    course_id INTEGER REFERENCES courses(id),
    current_lesson_id INTEGER REFERENCES lessons(id),
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    completed_at TIMESTAMP,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Lecciones completadas
CREATE TABLE IF NOT EXISTS completed_lessons (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    lesson_id INTEGER REFERENCES lessons(id),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);


-- =====================================================
-- SECCIÓN 9: COPY TRADING Y SEÑALES
-- =====================================================

-- Traders para copiar
CREATE TABLE IF NOT EXISTS copy_traders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    min_copy_amount DECIMAL(15,2) DEFAULT 100,
    profit_share DECIMAL(5,2) DEFAULT 20,
    total_copiers INTEGER DEFAULT 0,
    total_profit DECIMAL(15,2) DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relaciones de copy trading
CREATE TABLE IF NOT EXISTS copy_relationships (
    id SERIAL PRIMARY KEY,
    copier_id INTEGER REFERENCES users(id),
    trader_id INTEGER REFERENCES copy_traders(id),
    copy_amount DECIMAL(15,2) NOT NULL,
    copy_percentage DECIMAL(5,2) DEFAULT 100,
    total_profit DECIMAL(15,2) DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stopped_at TIMESTAMP,
    UNIQUE(copier_id, trader_id)
);

-- Trades copiados
CREATE TABLE IF NOT EXISTS copied_trades (
    id SERIAL PRIMARY KEY,
    relationship_id INTEGER REFERENCES copy_relationships(id),
    original_trade_id INTEGER REFERENCES trades(id),
    copied_trade_id INTEGER REFERENCES trades(id),
    copy_amount DECIMAL(15,2),
    profit DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Señales de trading
CREATE TABLE IF NOT EXISTS trading_signals (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES users(id),
    symbol VARCHAR(20) NOT NULL,
    direction VARCHAR(10) NOT NULL,
    entry_price DECIMAL(20,8),
    take_profit DECIMAL(20,8),
    stop_loss DECIMAL(20,8),
    timeframe VARCHAR(20),
    confidence INTEGER,
    analysis TEXT,
    status VARCHAR(20) DEFAULT 'active',
    result VARCHAR(20),
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suscripciones a señales
CREATE TABLE IF NOT EXISTS signal_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    provider_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active',
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    UNIQUE(user_id, provider_id)
);

-- =====================================================
-- SECCIÓN 10: GAMIFICACIÓN
-- =====================================================

-- Logros
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    category VARCHAR(50),
    points INTEGER DEFAULT 0,
    requirement_type VARCHAR(50),
    requirement_value INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logros de usuario
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    achievement_id INTEGER REFERENCES achievements(id),
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- Niveles de usuario
CREATE TABLE IF NOT EXISTS user_levels (
    id SERIAL PRIMARY KEY,
    level_number INTEGER UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    min_xp INTEGER NOT NULL,
    max_xp INTEGER,
    benefits JSONB DEFAULT '{}',
    badge_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- XP del usuario
CREATE TABLE IF NOT EXISTS user_xp (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    xp_to_next_level INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Historial de XP
CREATE TABLE IF NOT EXISTS xp_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount INTEGER NOT NULL,
    source VARCHAR(100) NOT NULL,
    source_id INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rachas diarias
CREATE TABLE IF NOT EXISTS daily_streaks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    total_days_active INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- SECCIÓN 11: OPERADOR - GESTIÓN DE USUARIOS
-- =====================================================

-- Acciones de operador sobre usuarios
CREATE TABLE IF NOT EXISTS operator_user_actions (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES users(id),
    user_id INTEGER REFERENCES users(id),
    action_type VARCHAR(100) NOT NULL,
    reason TEXT,
    details JSONB DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ajustes de balance por operador
CREATE TABLE IF NOT EXISTS balance_adjustments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    operator_id INTEGER REFERENCES users(id),
    adjustment_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2),
    balance_after DECIMAL(15,2),
    wallet_type VARCHAR(20) DEFAULT 'real',
    reason TEXT NOT NULL,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manipulación de trades
CREATE TABLE IF NOT EXISTS trade_manipulations (
    id SERIAL PRIMARY KEY,
    trade_id INTEGER REFERENCES trades(id),
    operator_id INTEGER REFERENCES users(id),
    manipulation_type VARCHAR(50) NOT NULL,
    original_result VARCHAR(20),
    forced_result VARCHAR(20),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Configuración de win rate por usuario
CREATE TABLE IF NOT EXISTS user_win_rate_config (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    target_win_rate DECIMAL(5,2),
    manipulation_enabled BOOLEAN DEFAULT false,
    manipulation_intensity VARCHAR(20) DEFAULT 'medium',
    set_by INTEGER REFERENCES users(id),
    set_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- =====================================================
-- SECCIÓN 12: OPERADOR - GESTIÓN DE TORNEOS
-- =====================================================

-- Configuración de torneos
CREATE TABLE IF NOT EXISTS tournament_config (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id) UNIQUE,
    auto_start BOOLEAN DEFAULT true,
    auto_end BOOLEAN DEFAULT true,
    allow_late_join BOOLEAN DEFAULT false,
    late_join_minutes INTEGER DEFAULT 30,
    min_participants INTEGER DEFAULT 2,
    prize_distribution JSONB DEFAULT '[]',
    rules TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Premios de torneos
CREATE TABLE IF NOT EXISTS tournament_prizes (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id),
    user_id INTEGER REFERENCES users(id),
    position INTEGER NOT NULL,
    prize_amount DECIMAL(15,2) NOT NULL,
    prize_type VARCHAR(50) DEFAULT 'cash',
    status VARCHAR(20) DEFAULT 'pending',
    paid_by INTEGER REFERENCES users(id),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trades de torneo
CREATE TABLE IF NOT EXISTS tournament_trades (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id),
    participant_id INTEGER REFERENCES tournament_participants(id),
    trade_id INTEGER REFERENCES trades(id),
    amount DECIMAL(15,2) NOT NULL,
    profit DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SECCIÓN 13: OPERADOR - GESTIÓN DE BONOS
-- =====================================================

-- Asignación manual de bonos
CREATE TABLE IF NOT EXISTS manual_bonus_assignments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    operator_id INTEGER REFERENCES users(id),
    bonus_type_id INTEGER REFERENCES bonus_types(id),
    amount DECIMAL(15,2) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campañas de bonos
CREATE TABLE IF NOT EXISTS bonus_campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    bonus_type_id INTEGER REFERENCES bonus_types(id),
    target_users JSONB DEFAULT '{}',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    budget DECIMAL(15,2),
    spent DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- SECCIÓN 14: CONTADOR - FINANZAS
-- =====================================================

-- Comisiones
CREATE TABLE IF NOT EXISTS commission_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    percentage DECIMAL(5,4),
    fixed_amount DECIMAL(15,2),
    applies_to VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS commissions (
    id SERIAL PRIMARY KEY,
    commission_type_id INTEGER REFERENCES commission_types(id),
    source_type VARCHAR(50) NOT NULL,
    source_id INTEGER,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(15,2) NOT NULL,
    percentage_applied DECIMAL(5,4),
    base_amount DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'collected',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Facturas
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_type VARCHAR(50) DEFAULT 'payable',
    client_name VARCHAR(200) NOT NULL,
    client_email VARCHAR(255),
    client_tax_id VARCHAR(50),
    amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    description TEXT,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conciliaciones
CREATE TABLE IF NOT EXISTS reconciliations (
    id SERIAL PRIMARY KEY,
    reconciliation_date DATE NOT NULL,
    expected_balance DECIMAL(15,2) NOT NULL,
    actual_balance DECIMAL(15,2) NOT NULL,
    difference DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    reconciled_by INTEGER REFERENCES users(id),
    reconciled_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reportes financieros
CREATE TABLE IF NOT EXISTS financial_reports (
    id SERIAL PRIMARY KEY,
    report_type VARCHAR(50) NOT NULL,
    report_name VARCHAR(200) NOT NULL,
    period_type VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_deposits DECIMAL(15,2) DEFAULT 0,
    total_withdrawals DECIMAL(15,2) DEFAULT 0,
    total_commissions DECIMAL(15,2) DEFAULT 0,
    net_revenue DECIMAL(15,2) DEFAULT 0,
    data JSONB DEFAULT '{}',
    generated_by INTEGER REFERENCES users(id),
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resúmenes diarios
CREATE TABLE IF NOT EXISTS daily_financial_summaries (
    id SERIAL PRIMARY KEY,
    summary_date DATE UNIQUE NOT NULL,
    total_deposits DECIMAL(15,2) DEFAULT 0,
    deposit_count INTEGER DEFAULT 0,
    total_withdrawals DECIMAL(15,2) DEFAULT 0,
    withdrawal_count INTEGER DEFAULT 0,
    total_commissions DECIMAL(15,2) DEFAULT 0,
    trading_volume DECIMAL(15,2) DEFAULT 0,
    platform_balance DECIMAL(15,2) DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SECCIÓN 15: AUDITORÍA Y LOGS
-- =====================================================

-- Logs de auditoría general
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    details TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logs de sistema
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    log_level VARCHAR(20) NOT NULL,
    source VARCHAR(100),
    message TEXT NOT NULL,
    stack_trace TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logs de actividad de usuario
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
