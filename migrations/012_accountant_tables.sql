-- Migration 012: Accountant (Contador) Tables
-- Sistema completo para el usuario contador

-- ========== 1. CONTADORES Y PERSONAL ==========
CREATE TABLE IF NOT EXISTS accountants (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(50) DEFAULT 'finance',
    position VARCHAR(100),
    hire_date DATE,
    supervisor_id INTEGER REFERENCES accountants(id),
    permissions JSONB DEFAULT '{}',
    daily_approval_limit DECIMAL(15,2) DEFAULT 10000.00,
    single_transaction_limit DECIMAL(15,2) DEFAULT 5000.00,
    auto_approve_below DECIMAL(15,2) DEFAULT 100.00,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accountant_shifts (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id),
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    transactions_processed INTEGER DEFAULT 0,
    total_approved DECIMAL(15,2) DEFAULT 0,
    total_rejected DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== 2. GESTIÓN DE RETIROS ==========
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    method VARCHAR(50) NOT NULL,
    network VARCHAR(50),
    wallet_address VARCHAR(255),
    user_balance_at_request DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'normal',
    risk_score INTEGER DEFAULT 0,
    risk_flags JSONB DEFAULT '[]',
    processed_by INTEGER REFERENCES accountants(id),
    processed_at TIMESTAMP,
    rejection_reason TEXT,
    tx_hash VARCHAR(255),
    fee_amount DECIMAL(15,4) DEFAULT 0,
    net_amount DECIMAL(15,2),
    notes TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS withdrawal_approvals (
    id SERIAL PRIMARY KEY,
    withdrawal_id INTEGER REFERENCES withdrawal_requests(id),
    accountant_id INTEGER REFERENCES accountants(id),
    action VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2),
    reason TEXT,
    verified_wallet BOOLEAN DEFAULT false,
    verified_balance BOOLEAN DEFAULT false,
    verified_kyc BOOLEAN DEFAULT false,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS withdrawal_limits (
    id SERIAL PRIMARY KEY,
    user_type VARCHAR(50),
    kyc_level INTEGER,
    daily_limit DECIMAL(15,2),
    weekly_limit DECIMAL(15,2),
    monthly_limit DECIMAL(15,2),
    single_transaction_limit DECIMAL(15,2),
    min_withdrawal DECIMAL(15,2) DEFAULT 10.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== 3. GESTIÓN DE DEPÓSITOS ==========
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
    confirmed_by INTEGER REFERENCES accountants(id),
    confirmed_at TIMESTAMP,
    rejection_reason TEXT,
    credited_amount DECIMAL(15,2),
    fee_amount DECIMAL(15,4) DEFAULT 0,
    notes TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deposit_confirmations (
    id SERIAL PRIMARY KEY,
    deposit_id INTEGER REFERENCES deposit_requests(id),
    accountant_id INTEGER REFERENCES accountants(id),
    action VARCHAR(20) NOT NULL,
    verified_tx_hash BOOLEAN DEFAULT false,
    verified_amount BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== 4. PREMIOS DE TORNEOS ==========
CREATE TABLE IF NOT EXISTS tournament_prizes (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER,
    user_id INTEGER REFERENCES users(id),
    tournament_name VARCHAR(200),
    position INTEGER NOT NULL,
    prize_amount DECIMAL(15,2) NOT NULL,
    prize_type VARCHAR(50) DEFAULT 'cash',
    status VARCHAR(20) DEFAULT 'pending',
    paid_by INTEGER REFERENCES accountants(id),
    paid_at TIMESTAMP,
    payment_method VARCHAR(50),
    tx_reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prize_payments (
    id SERIAL PRIMARY KEY,
    prize_id INTEGER REFERENCES tournament_prizes(id),
    accountant_id INTEGER REFERENCES accountants(id),
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50),
    destination_wallet VARCHAR(255),
    tx_hash VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    processed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== 5. USUARIOS FINANCIEROS ==========
CREATE TABLE IF NOT EXISTS user_financial_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    current_balance DECIMAL(15,2) DEFAULT 0,
    total_deposits DECIMAL(15,2) DEFAULT 0,
    total_withdrawals DECIMAL(15,2) DEFAULT 0,
    total_bonuses DECIMAL(15,2) DEFAULT 0,
    total_prizes DECIMAL(15,2) DEFAULT 0,
    total_trading_volume DECIMAL(15,2) DEFAULT 0,
    net_profit_loss DECIMAL(15,2) DEFAULT 0,
    risk_level VARCHAR(20) DEFAULT 'normal',
    financial_status VARCHAR(20) DEFAULT 'active',
    last_deposit_at TIMESTAMP,
    last_withdrawal_at TIMESTAMP,
    suspended_by INTEGER REFERENCES accountants(id),
    suspension_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_balance_adjustments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    accountant_id INTEGER REFERENCES accountants(id),
    adjustment_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2),
    balance_after DECIMAL(15,2),
    reason TEXT NOT NULL,
    reference_id VARCHAR(100),
    approved_by INTEGER REFERENCES accountants(id),
    approved_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_financial_suspensions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    accountant_id INTEGER REFERENCES accountants(id),
    suspension_type VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    evidence JSONB DEFAULT '[]',
    suspended_at TIMESTAMP DEFAULT NOW(),
    lifted_at TIMESTAMP,
    lifted_by INTEGER REFERENCES accountants(id),
    is_permanent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
