-- Migration 013: Accountant Tables V2
-- Comisiones, Facturación, Conciliación, Reportes

-- ========== 6. COMISIONES ==========
CREATE TABLE IF NOT EXISTS commission_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    percentage DECIMAL(5,4),
    fixed_amount DECIMAL(15,2),
    min_amount DECIMAL(15,2),
    max_amount DECIMAL(15,2),
    applies_to VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
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
    currency VARCHAR(10) DEFAULT 'USD',
    description TEXT,
    status VARCHAR(20) DEFAULT 'collected',
    collected_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== 7. FACTURACIÓN ==========
CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE,
    tax_id VARCHAR(50),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    country VARCHAR(100),
    category VARCHAR(100),
    payment_terms INTEGER DEFAULT 30,
    preferred_payment_method VARCHAR(50),
    bank_details JSONB,
    contact_person VARCHAR(200),
    is_active BOOLEAN DEFAULT true,
    total_invoices INTEGER DEFAULT 0,
    total_paid DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_type VARCHAR(50) DEFAULT 'payable',
    vendor_id INTEGER REFERENCES vendors(id),
    client_name VARCHAR(200) NOT NULL,
    client_email VARCHAR(255),
    client_tax_id VARCHAR(50),
    amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    description TEXT,
    line_items JSONB DEFAULT '[]',
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    notes TEXT,
    attachments JSONB DEFAULT '[]',
    created_by INTEGER REFERENCES accountants(id),
    paid_by INTEGER REFERENCES accountants(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id),
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),
    reference VARCHAR(255),
    notes TEXT,
    recorded_by INTEGER REFERENCES accountants(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== 8. CONCILIACIÓN BANCARIA ==========
CREATE TABLE IF NOT EXISTS bank_accounts (
    id SERIAL PRIMARY KEY,
    account_name VARCHAR(200) NOT NULL,
    account_number VARCHAR(100),
    bank_name VARCHAR(200) NOT NULL,
    bank_code VARCHAR(50),
    swift_code VARCHAR(20),
    iban VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'USD',
    account_type VARCHAR(50),
    current_balance DECIMAL(15,2) DEFAULT 0,
    available_balance DECIMAL(15,2) DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_reconciled DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reconciliations (
    id SERIAL PRIMARY KEY,
    bank_account_id INTEGER REFERENCES bank_accounts(id),
    reconciliation_date DATE NOT NULL,
    period_start DATE,
    period_end DATE,
    expected_balance DECIMAL(15,2) NOT NULL,
    actual_balance DECIMAL(15,2) NOT NULL,
    difference DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    reconciled_by INTEGER REFERENCES accountants(id),
    reconciled_at TIMESTAMP,
    resolution_notes TEXT,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reconciliation_items (
    id SERIAL PRIMARY KEY,
    reconciliation_id INTEGER REFERENCES reconciliations(id),
    item_type VARCHAR(50) NOT NULL,
    reference_id INTEGER,
    reference_type VARCHAR(50),
    expected_amount DECIMAL(15,2),
    actual_amount DECIMAL(15,2),
    difference DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    resolved_by INTEGER REFERENCES accountants(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_statements (
    id SERIAL PRIMARY KEY,
    bank_account_id INTEGER REFERENCES bank_accounts(id),
    statement_date DATE NOT NULL,
    opening_balance DECIMAL(15,2),
    closing_balance DECIMAL(15,2),
    total_credits DECIMAL(15,2),
    total_debits DECIMAL(15,2),
    transaction_count INTEGER,
    file_path VARCHAR(500),
    imported_by INTEGER REFERENCES accountants(id),
    imported_at TIMESTAMP DEFAULT NOW(),
    reconciled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_transactions (
    id SERIAL PRIMARY KEY,
    bank_statement_id INTEGER REFERENCES bank_statements(id),
    bank_account_id INTEGER REFERENCES bank_accounts(id),
    transaction_date DATE NOT NULL,
    value_date DATE,
    description TEXT,
    reference VARCHAR(255),
    debit_amount DECIMAL(15,2),
    credit_amount DECIMAL(15,2),
    balance DECIMAL(15,2),
    category VARCHAR(100),
    matched BOOLEAN DEFAULT false,
    matched_to_id INTEGER,
    matched_to_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== 9. REPORTES FINANCIEROS ==========
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
    total_prizes DECIMAL(15,2) DEFAULT 0,
    total_bonuses DECIMAL(15,2) DEFAULT 0,
    net_revenue DECIMAL(15,2) DEFAULT 0,
    gross_profit DECIMAL(15,2) DEFAULT 0,
    operating_expenses DECIMAL(15,2) DEFAULT 0,
    net_profit DECIMAL(15,2) DEFAULT 0,
    platform_balance DECIMAL(15,2) DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    data JSONB DEFAULT '{}',
    generated_by INTEGER REFERENCES accountants(id),
    generated_at TIMESTAMP DEFAULT NOW(),
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_financial_summaries (
    id SERIAL PRIMARY KEY,
    summary_date DATE UNIQUE NOT NULL,
    total_deposits DECIMAL(15,2) DEFAULT 0,
    deposit_count INTEGER DEFAULT 0,
    total_withdrawals DECIMAL(15,2) DEFAULT 0,
    withdrawal_count INTEGER DEFAULT 0,
    pending_withdrawals DECIMAL(15,2) DEFAULT 0,
    pending_deposits DECIMAL(15,2) DEFAULT 0,
    total_commissions DECIMAL(15,2) DEFAULT 0,
    total_prizes_paid DECIMAL(15,2) DEFAULT 0,
    total_bonuses_given DECIMAL(15,2) DEFAULT 0,
    trading_volume DECIMAL(15,2) DEFAULT 0,
    platform_balance DECIMAL(15,2) DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_registrations INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS monthly_financial_summaries (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    total_deposits DECIMAL(15,2) DEFAULT 0,
    total_withdrawals DECIMAL(15,2) DEFAULT 0,
    total_commissions DECIMAL(15,2) DEFAULT 0,
    total_prizes DECIMAL(15,2) DEFAULT 0,
    total_bonuses DECIMAL(15,2) DEFAULT 0,
    operating_expenses DECIMAL(15,2) DEFAULT 0,
    net_revenue DECIMAL(15,2) DEFAULT 0,
    gross_profit DECIMAL(15,2) DEFAULT 0,
    net_profit DECIMAL(15,2) DEFAULT 0,
    growth_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(year, month)
);
