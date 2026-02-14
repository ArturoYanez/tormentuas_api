# DATABASE SCHEMA - USUARIO CONTADOR

## Descripción General
Este documento detalla el esquema de base de datos para el usuario **CONTADOR** de la plataforma de trading. El contador tiene acceso a funcionalidades financieras, gestión de transacciones, conciliación, facturación y auditoría.

---

## 1. CONTADORES Y PERSONAL FINANCIERO

### 1.1 accountants (Contadores)
```sql
CREATE TABLE accountants (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(50) DEFAULT 'finance',
    position VARCHAR(100),
    hire_date DATE,
    supervisor_id INTEGER REFERENCES accountants(id),
    permissions JSONB DEFAULT '{}',
    daily_approval_limit DECIMAL(15,2) DEFAULT 10000.00,
    single_transaction_limit DECIMAL(15,2) DEFAULT 5000.00,
    auto_approve_below DECIMAL(15,2) DEFAULT 100.00,
    require_approval_above DECIMAL(15,2) DEFAULT 1000.00,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.2 accountant_permissions (Permisos de Contadores)
```sql
CREATE TABLE accountant_permissions (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id),
    permission_type VARCHAR(50) NOT NULL,
    can_view BOOLEAN DEFAULT true,
    can_create BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_approve BOOLEAN DEFAULT false,
    max_amount DECIMAL(15,2),
    granted_by INTEGER REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);
```

### 1.3 accountant_shifts (Turnos de Contadores)
```sql
CREATE TABLE accountant_shifts (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. GESTIÓN DE RETIROS

### 2.1 withdrawal_requests (Solicitudes de Retiro)
```sql
CREATE TABLE withdrawal_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    od_id VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    method VARCHAR(50) NOT NULL,
    network VARCHAR(50),
    wallet_address VARCHAR(255),
    bank_account_id INTEGER,
    user_balance_at_request DECIMAL(15,2),
    user_total_deposits DECIMAL(15,2),
    user_total_withdrawals DECIMAL(15,2),
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
    ip_address INET,
    device_info JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 withdrawal_processing_queue (Cola de Procesamiento de Retiros)
```sql
CREATE TABLE withdrawal_processing_queue (
    id SERIAL PRIMARY KEY,
    withdrawal_id INTEGER REFERENCES withdrawal_requests(id),
    assigned_to INTEGER REFERENCES accountants(id),
    priority INTEGER DEFAULT 5,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'queued',
    attempts INTEGER DEFAULT 0,
    last_error TEXT
);
```

### 2.3 withdrawal_approvals (Aprobaciones de Retiros)
```sql
CREATE TABLE withdrawal_approvals (
    id SERIAL PRIMARY KEY,
    withdrawal_id INTEGER REFERENCES withdrawal_requests(id),
    accountant_id INTEGER REFERENCES accountants(id),
    action VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2),
    reason TEXT,
    verification_method VARCHAR(50),
    verified_wallet BOOLEAN DEFAULT false,
    verified_balance BOOLEAN DEFAULT false,
    verified_kyc BOOLEAN DEFAULT false,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.4 withdrawal_limits (Límites de Retiro)
```sql
CREATE TABLE withdrawal_limits (
    id SERIAL PRIMARY KEY,
    user_type VARCHAR(50),
    kyc_level INTEGER,
    daily_limit DECIMAL(15,2),
    weekly_limit DECIMAL(15,2),
    monthly_limit DECIMAL(15,2),
    single_transaction_limit DECIMAL(15,2),
    min_withdrawal DECIMAL(15,2) DEFAULT 10.00,
    max_withdrawal DECIMAL(15,2),
    cooldown_hours INTEGER DEFAULT 0,
    requires_approval_above DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. GESTIÓN DE DEPÓSITOS

### 3.1 deposit_requests (Solicitudes de Depósito)
```sql
CREATE TABLE deposit_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    od_id VARCHAR(20) NOT NULL,
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
    exchange_rate DECIMAL(15,8),
    notes TEXT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 deposit_confirmations (Confirmaciones de Depósito)
```sql
CREATE TABLE deposit_confirmations (
    id SERIAL PRIMARY KEY,
    deposit_id INTEGER REFERENCES deposit_requests(id),
    accountant_id INTEGER REFERENCES accountants(id),
    action VARCHAR(20) NOT NULL,
    verified_tx_hash BOOLEAN DEFAULT false,
    verified_amount BOOLEAN DEFAULT false,
    verified_source BOOLEAN DEFAULT false,
    notes TEXT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.3 deposit_addresses (Direcciones de Depósito)
```sql
CREATE TABLE deposit_addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    currency VARCHAR(10) NOT NULL,
    network VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    memo VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    total_received DECIMAL(15,2) DEFAULT 0,
    last_deposit_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. PREMIOS DE TORNEOS

### 4.1 tournament_prizes (Premios de Torneos)
```sql
CREATE TABLE tournament_prizes (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id),
    user_id INTEGER REFERENCES users(id),
    od_id VARCHAR(20) NOT NULL,
    od_name VARCHAR(100),
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
    tournament_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 prize_payments (Pagos de Premios)
```sql
CREATE TABLE prize_payments (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. USUARIOS FINANCIEROS

### 5.1 user_financial_profiles (Perfiles Financieros de Usuarios)
```sql
CREATE TABLE user_financial_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    od_id VARCHAR(20) NOT NULL,
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
    last_activity_at TIMESTAMP,
    suspended_at TIMESTAMP,
    suspended_by INTEGER REFERENCES accountants(id),
    suspension_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.2 user_balance_adjustments (Ajustes de Balance de Usuarios)
```sql
CREATE TABLE user_balance_adjustments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    accountant_id INTEGER REFERENCES accountants(id),
    adjustment_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2),
    balance_after DECIMAL(15,2),
    reason TEXT NOT NULL,
    reference_id VARCHAR(100),
    reference_type VARCHAR(50),
    approved_by INTEGER REFERENCES accountants(id),
    approved_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.3 user_financial_transactions (Transacciones Financieras de Usuarios)
```sql
CREATE TABLE user_financial_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    balance_before DECIMAL(15,2),
    balance_after DECIMAL(15,2),
    reference_id INTEGER,
    reference_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'completed',
    details TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.4 user_financial_suspensions (Suspensiones Financieras)
```sql
CREATE TABLE user_financial_suspensions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    accountant_id INTEGER REFERENCES accountants(id),
    suspension_type VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    evidence JSONB DEFAULT '[]',
    suspended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lifted_at TIMESTAMP,
    lifted_by INTEGER REFERENCES accountants(id),
    lift_reason TEXT,
    is_permanent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. COMISIONES

### 6.1 commission_types (Tipos de Comisión)
```sql
CREATE TABLE commission_types (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6.2 commissions (Comisiones)
```sql
CREATE TABLE commissions (
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
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6.3 commission_reports (Reportes de Comisiones)
```sql
CREATE TABLE commission_reports (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL,
    commission_type_id INTEGER REFERENCES commission_types(id),
    total_transactions INTEGER DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    total_base_amount DECIMAL(15,2) DEFAULT 0,
    average_percentage DECIMAL(5,4),
    generated_by INTEGER REFERENCES accountants(id),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);
```

### 6.4 commission_distributions (Distribución de Comisiones)
```sql
CREATE TABLE commission_distributions (
    id SERIAL PRIMARY KEY,
    commission_id INTEGER REFERENCES commissions(id),
    recipient_type VARCHAR(50) NOT NULL,
    recipient_id INTEGER,
    amount DECIMAL(15,2) NOT NULL,
    percentage DECIMAL(5,4),
    status VARCHAR(20) DEFAULT 'pending',
    distributed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. FACTURACIÓN

### 7.1 invoices (Facturas)
```sql
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_type VARCHAR(50) DEFAULT 'payable',
    client_name VARCHAR(200) NOT NULL,
    client_email VARCHAR(255),
    client_tax_id VARCHAR(50),
    client_address TEXT,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7.2 invoice_line_items (Líneas de Factura)
```sql
CREATE TABLE invoice_line_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id),
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7.3 invoice_reminders (Recordatorios de Facturas)
```sql
CREATE TABLE invoice_reminders (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id),
    reminder_type VARCHAR(50) NOT NULL,
    sent_to VARCHAR(255),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_by INTEGER REFERENCES accountants(id),
    message TEXT,
    response TEXT,
    response_at TIMESTAMP
);
```

### 7.4 invoice_payments (Pagos de Facturas)
```sql
CREATE TABLE invoice_payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id),
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),
    reference VARCHAR(255),
    notes TEXT,
    recorded_by INTEGER REFERENCES accountants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7.5 vendors (Proveedores)
```sql
CREATE TABLE vendors (
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
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    total_invoices INTEGER DEFAULT 0,
    total_paid DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 8. CONCILIACIÓN BANCARIA

### 8.1 reconciliations (Conciliaciones)
```sql
CREATE TABLE reconciliations (
    id SERIAL PRIMARY KEY,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8.2 reconciliation_items (Items de Conciliación)
```sql
CREATE TABLE reconciliation_items (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8.3 reconciliation_discrepancies (Discrepancias de Conciliación)
```sql
CREATE TABLE reconciliation_discrepancies (
    id SERIAL PRIMARY KEY,
    reconciliation_id INTEGER REFERENCES reconciliations(id),
    discrepancy_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    root_cause TEXT,
    resolution TEXT,
    status VARCHAR(20) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_to INTEGER REFERENCES accountants(id),
    resolved_by INTEGER REFERENCES accountants(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8.4 bank_statements (Estados de Cuenta Bancarios)
```sql
CREATE TABLE bank_statements (
    id SERIAL PRIMARY KEY,
    bank_account_id INTEGER,
    statement_date DATE NOT NULL,
    opening_balance DECIMAL(15,2),
    closing_balance DECIMAL(15,2),
    total_credits DECIMAL(15,2),
    total_debits DECIMAL(15,2),
    transaction_count INTEGER,
    file_path VARCHAR(500),
    imported_by INTEGER REFERENCES accountants(id),
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reconciled BOOLEAN DEFAULT false,
    reconciled_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8.5 bank_transactions (Transacciones Bancarias)
```sql
CREATE TABLE bank_transactions (
    id SERIAL PRIMARY KEY,
    bank_statement_id INTEGER REFERENCES bank_statements(id),
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 9. REPORTES FINANCIEROS

### 9.1 financial_reports (Reportes Financieros)
```sql
CREATE TABLE financial_reports (
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
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 9.2 daily_financial_summaries (Resúmenes Financieros Diarios)
```sql
CREATE TABLE daily_financial_summaries (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 9.3 weekly_financial_summaries (Resúmenes Financieros Semanales)
```sql
CREATE TABLE weekly_financial_summaries (
    id SERIAL PRIMARY KEY,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    year INTEGER NOT NULL,
    week_number INTEGER NOT NULL,
    total_deposits DECIMAL(15,2) DEFAULT 0,
    total_withdrawals DECIMAL(15,2) DEFAULT 0,
    total_commissions DECIMAL(15,2) DEFAULT 0,
    total_prizes DECIMAL(15,2) DEFAULT 0,
    net_revenue DECIMAL(15,2) DEFAULT 0,
    gross_profit DECIMAL(15,2) DEFAULT 0,
    average_daily_volume DECIMAL(15,2) DEFAULT 0,
    peak_day DATE,
    peak_volume DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, week_number)
);
```

### 9.4 monthly_financial_summaries (Resúmenes Financieros Mensuales)
```sql
CREATE TABLE monthly_financial_summaries (
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
    user_retention_rate DECIMAL(5,2),
    average_user_balance DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, month)
);
```

### 9.5 report_exports (Exportaciones de Reportes)
```sql
CREATE TABLE report_exports (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES financial_reports(id),
    export_type VARCHAR(20) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_size INTEGER,
    exported_by INTEGER REFERENCES accountants(id),
    exported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP
);
```

---

## 10. AUDITORÍA FINANCIERA

### 10.1 audit_logs (Logs de Auditoría)
```sql
CREATE TABLE audit_logs (
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
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    risk_level VARCHAR(20) DEFAULT 'low',
    reviewed BOOLEAN DEFAULT false,
    reviewed_by INTEGER REFERENCES accountants(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 10.2 audit_trails (Rastros de Auditoría)
```sql
CREATE TABLE audit_trails (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER,
    transaction_type VARCHAR(50) NOT NULL,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    performed_by INTEGER REFERENCES users(id),
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20),
    notes TEXT,
    metadata JSONB DEFAULT '{}'
);
```

### 10.3 audit_reviews (Revisiones de Auditoría)
```sql
CREATE TABLE audit_reviews (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 10.4 compliance_checks (Verificaciones de Cumplimiento)
```sql
CREATE TABLE compliance_checks (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 11. ALERTAS SOSPECHOSAS

### 11.1 suspicious_alerts (Alertas Sospechosas)
```sql
CREATE TABLE suspicious_alerts (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 11.2 suspicious_patterns (Patrones Sospechosos)
```sql
CREATE TABLE suspicious_patterns (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 11.3 user_risk_profiles (Perfiles de Riesgo de Usuarios)
```sql
CREATE TABLE user_risk_profiles (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 11.4 fraud_investigations (Investigaciones de Fraude)
```sql
CREATE TABLE fraud_investigations (
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
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    closed_by INTEGER REFERENCES accountants(id)
);
```

---

## 12. CHAT INTERNO

### 12.1 internal_chat_messages (Mensajes de Chat Interno)
```sql
CREATE TABLE internal_chat_messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    sender_role VARCHAR(50) NOT NULL,
    recipient_id INTEGER REFERENCES users(id),
    recipient_role VARCHAR(50),
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    attachment_url VARCHAR(500),
    attachment_type VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    is_urgent BOOLEAN DEFAULT false,
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 12.2 internal_chat_contacts (Contactos de Chat Interno)
```sql
CREATE TABLE internal_chat_contacts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    contact_id INTEGER REFERENCES users(id),
    contact_role VARCHAR(50),
    is_favorite BOOLEAN DEFAULT false,
    last_message_at TIMESTAMP,
    unread_count INTEGER DEFAULT 0,
    is_muted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, contact_id)
);
```

### 12.3 internal_chat_groups (Grupos de Chat Interno)
```sql
CREATE TABLE internal_chat_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 12.4 internal_chat_group_members (Miembros de Grupos de Chat)
```sql
CREATE TABLE internal_chat_group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES internal_chat_groups(id),
    user_id INTEGER REFERENCES users(id),
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);
```

---

## 13. CONFIGURACIÓN DEL CONTADOR

### 13.1 accountant_settings (Configuración del Contador)
```sql
CREATE TABLE accountant_settings (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) UNIQUE,
    timezone VARCHAR(100) DEFAULT 'Europe/Madrid',
    language VARCHAR(10) DEFAULT 'es',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    currency_format VARCHAR(20) DEFAULT 'USD',
    theme VARCHAR(20) DEFAULT 'dark',
    sidebar_collapsed BOOLEAN DEFAULT false,
    dashboard_layout JSONB DEFAULT '{}',
    default_view VARCHAR(50) DEFAULT 'dashboard',
    items_per_page INTEGER DEFAULT 25,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 13.2 accountant_notification_settings (Configuración de Notificaciones)
```sql
CREATE TABLE accountant_notification_settings (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) UNIQUE,
    email_new_withdrawal BOOLEAN DEFAULT true,
    email_large_transaction BOOLEAN DEFAULT true,
    email_daily_report BOOLEAN DEFAULT true,
    email_weekly_report BOOLEAN DEFAULT false,
    push_new_withdrawal BOOLEAN DEFAULT true,
    push_urgent BOOLEAN DEFAULT true,
    push_suspicious_alert BOOLEAN DEFAULT true,
    sound_enabled BOOLEAN DEFAULT true,
    large_transaction_threshold DECIMAL(15,2) DEFAULT 1000.00,
    urgent_withdrawal_threshold DECIMAL(15,2) DEFAULT 5000.00,
    digest_frequency VARCHAR(20) DEFAULT 'daily',
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 13.3 accountant_approval_limits (Límites de Aprobación)
```sql
CREATE TABLE accountant_approval_limits (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id),
    transaction_type VARCHAR(50) NOT NULL,
    daily_limit DECIMAL(15,2),
    single_transaction_limit DECIMAL(15,2),
    require_second_approval_above DECIMAL(15,2),
    auto_approve_below DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(accountant_id, transaction_type)
);
```

---

## 14. SEGURIDAD DEL CONTADOR

### 14.1 accountant_sessions (Sesiones del Contador)
```sql
CREATE TABLE accountant_sessions (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id),
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
```

### 14.2 accountant_login_history (Historial de Login del Contador)
```sql
CREATE TABLE accountant_login_history (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id),
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
```

### 14.3 accountant_trusted_devices (Dispositivos de Confianza)
```sql
CREATE TABLE accountant_trusted_devices (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id),
    device_name VARCHAR(200) NOT NULL,
    device_type VARCHAR(50),
    device_fingerprint VARCHAR(255) UNIQUE,
    last_used TIMESTAMP,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);
```

### 14.4 accountant_two_factor (Autenticación de Dos Factores)
```sql
CREATE TABLE accountant_two_factor (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) UNIQUE,
    is_enabled BOOLEAN DEFAULT false,
    method VARCHAR(20) DEFAULT 'app',
    secret_key VARCHAR(255),
    backup_codes TEXT[],
    phone_number VARCHAR(50),
    email VARCHAR(255),
    last_used TIMESTAMP,
    setup_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 14.5 accountant_security_questions (Preguntas de Seguridad)
```sql
CREATE TABLE accountant_security_questions (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id),
    question TEXT NOT NULL,
    answer_hash VARCHAR(255) NOT NULL,
    question_order INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 14.6 accountant_activity_logs (Logs de Actividad del Contador)
```sql
CREATE TABLE accountant_activity_logs (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id),
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 15. MÉTRICAS Y ESTADÍSTICAS

### 15.1 platform_metrics (Métricas de Plataforma)
```sql
CREATE TABLE platform_metrics (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, metric_hour)
);
```

### 15.2 financial_kpis (KPIs Financieros)
```sql
CREATE TABLE financial_kpis (
    id SERIAL PRIMARY KEY,
    kpi_date DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL,
    revenue DECIMAL(15,2) DEFAULT 0,
    expenses DECIMAL(15,2) DEFAULT 0,
    gross_margin DECIMAL(5,2),
    net_margin DECIMAL(5,2),
    customer_acquisition_cost DECIMAL(15,2),
    lifetime_value DECIMAL(15,2),
    churn_rate DECIMAL(5,2),
    deposit_to_withdrawal_ratio DECIMAL(5,2),
    average_transaction_value DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(kpi_date, period_type)
);
```

### 15.3 transaction_statistics (Estadísticas de Transacciones)
```sql
CREATE TABLE transaction_statistics (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(stat_date, transaction_type)
);
```

### 15.4 user_statistics (Estadísticas de Usuarios)
```sql
CREATE TABLE user_statistics (
    id SERIAL PRIMARY KEY,
    stat_date DATE NOT NULL,
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    verified_users INTEGER DEFAULT 0,
    suspended_users INTEGER DEFAULT 0,
    users_with_balance INTEGER DEFAULT 0,
    total_user_balance DECIMAL(15,2) DEFAULT 0,
    average_user_balance DECIMAL(15,2) DEFAULT 0,
    top_depositors_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(stat_date)
);
```

---

## 16. EXPORTACIONES Y DESCARGAS

### 16.1 data_exports (Exportaciones de Datos)
```sql
CREATE TABLE data_exports (
    id SERIAL PRIMARY KEY,
    export_type VARCHAR(100) NOT NULL,
    export_format VARCHAR(20) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_size INTEGER,
    filters JSONB DEFAULT '{}',
    date_range_start DATE,
    date_range_end DATE,
    record_count INTEGER,
    exported_by INTEGER REFERENCES accountants(id),
    exported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP,
    expires_at TIMESTAMP
);
```

### 16.2 scheduled_exports (Exportaciones Programadas)
```sql
CREATE TABLE scheduled_exports (
    id SERIAL PRIMARY KEY,
    export_type VARCHAR(100) NOT NULL,
    export_format VARCHAR(20) NOT NULL,
    schedule_type VARCHAR(20) NOT NULL,
    schedule_time TIME,
    schedule_day INTEGER,
    filters JSONB DEFAULT '{}',
    recipients TEXT[],
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    created_by INTEGER REFERENCES accountants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 17. PROVEEDORES DE PAGO

### 17.1 payment_providers (Proveedores de Pago)
```sql
CREATE TABLE payment_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    provider_type VARCHAR(50) NOT NULL,
    supported_currencies TEXT[],
    supported_networks TEXT[],
    api_endpoint VARCHAR(500),
    api_credentials JSONB,
    fee_structure JSONB,
    min_transaction DECIMAL(15,2),
    max_transaction DECIMAL(15,2),
    daily_limit DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active',
    last_health_check TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 17.2 payment_provider_transactions (Transacciones de Proveedores)
```sql
CREATE TABLE payment_provider_transactions (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES payment_providers(id),
    transaction_type VARCHAR(50) NOT NULL,
    internal_reference VARCHAR(100),
    external_reference VARCHAR(255),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10),
    fee_amount DECIMAL(15,4),
    net_amount DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'pending',
    response_code VARCHAR(50),
    response_message TEXT,
    raw_response JSONB,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 17.3 payment_provider_balances (Balances de Proveedores)
```sql
CREATE TABLE payment_provider_balances (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES payment_providers(id),
    currency VARCHAR(10) NOT NULL,
    available_balance DECIMAL(15,2) DEFAULT 0,
    pending_balance DECIMAL(15,2) DEFAULT 0,
    reserved_balance DECIMAL(15,2) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider_id, currency)
);
```

---

## 18. GASTOS OPERATIVOS

### 18.1 operating_expenses (Gastos Operativos)
```sql
CREATE TABLE operating_expenses (
    id SERIAL PRIMARY KEY,
    expense_category VARCHAR(100) NOT NULL,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 18.2 expense_categories (Categorías de Gastos)
```sql
CREATE TABLE expense_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    parent_id INTEGER REFERENCES expense_categories(id),
    description TEXT,
    budget_monthly DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 18.3 expense_budgets (Presupuestos de Gastos)
```sql
CREATE TABLE expense_budgets (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES expense_categories(id),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    budgeted_amount DECIMAL(15,2) NOT NULL,
    actual_amount DECIMAL(15,2) DEFAULT 0,
    variance DECIMAL(15,2) DEFAULT 0,
    variance_percentage DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, year, month)
);
```

---

## 19. CUENTAS BANCARIAS

### 19.1 bank_accounts (Cuentas Bancarias)
```sql
CREATE TABLE bank_accounts (
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
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 19.2 bank_account_movements (Movimientos de Cuentas Bancarias)
```sql
CREATE TABLE bank_account_movements (
    id SERIAL PRIMARY KEY,
    bank_account_id INTEGER REFERENCES bank_accounts(id),
    movement_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2),
    balance_after DECIMAL(15,2),
    reference VARCHAR(255),
    description TEXT,
    counterparty VARCHAR(200),
    movement_date DATE NOT NULL,
    value_date DATE,
    reconciled BOOLEAN DEFAULT false,
    reconciled_with_id INTEGER,
    reconciled_with_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 20. NOTIFICACIONES DEL CONTADOR

### 20.1 accountant_notifications (Notificaciones del Contador)
```sql
CREATE TABLE accountant_notifications (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 20.2 notification_templates (Plantillas de Notificaciones)
```sql
CREATE TABLE notification_templates (
    id SERIAL PRIMARY KEY,
    template_code VARCHAR(100) UNIQUE NOT NULL,
    template_name VARCHAR(200) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    body_template TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 21. PERFIL DEL CONTADOR

### 21.1 accountant_profiles (Perfiles de Contadores)
```sql
CREATE TABLE accountant_profiles (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    avatar_url VARCHAR(500),
    bio TEXT,
    timezone VARCHAR(100) DEFAULT 'Europe/Madrid',
    language VARCHAR(10) DEFAULT 'es',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 21.2 accountant_certifications (Certificaciones del Contador)
```sql
CREATE TABLE accountant_certifications (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id),
    certification_name VARCHAR(200) NOT NULL,
    issuing_organization VARCHAR(200),
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(100),
    verification_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 22. TAREAS Y WORKFLOW

### 22.1 accountant_tasks (Tareas del Contador)
```sql
CREATE TABLE accountant_tasks (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 22.2 approval_workflows (Flujos de Aprobación)
```sql
CREATE TABLE approval_workflows (
    id SERIAL PRIMARY KEY,
    workflow_name VARCHAR(200) NOT NULL,
    workflow_type VARCHAR(100) NOT NULL,
    trigger_conditions JSONB NOT NULL,
    approval_steps JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 22.3 approval_requests (Solicitudes de Aprobación)
```sql
CREATE TABLE approval_requests (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER REFERENCES approval_workflows(id),
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    current_step INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending',
    requested_by INTEGER REFERENCES users(id),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT
);
```

### 22.4 approval_steps (Pasos de Aprobación)
```sql
CREATE TABLE approval_steps (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES approval_requests(id),
    step_number INTEGER NOT NULL,
    approver_id INTEGER REFERENCES accountants(id),
    status VARCHAR(20) DEFAULT 'pending',
    decision VARCHAR(20),
    comments TEXT,
    decided_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ÍNDICES RECOMENDADOS

```sql
-- Índices para búsquedas frecuentes
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX idx_withdrawal_requests_user ON withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_requests_date ON withdrawal_requests(created_at);
CREATE INDEX idx_deposit_requests_status ON deposit_requests(status);
CREATE INDEX idx_deposit_requests_user ON deposit_requests(user_id);
CREATE INDEX idx_audit_logs_accountant ON audit_logs(accountant_id);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_type ON audit_logs(action_type);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_reconciliations_status ON reconciliations(status);
CREATE INDEX idx_reconciliations_date ON reconciliations(reconciliation_date);
CREATE INDEX idx_suspicious_alerts_status ON suspicious_alerts(status);
CREATE INDEX idx_suspicious_alerts_user ON suspicious_alerts(user_id);
CREATE INDEX idx_commissions_date ON commissions(collected_at);
CREATE INDEX idx_financial_reports_date ON financial_reports(period_start, period_end);
CREATE INDEX idx_accountant_sessions_token ON accountant_sessions(session_token);
CREATE INDEX idx_accountant_notifications_read ON accountant_notifications(accountant_id, is_read);
```

---

## RESUMEN DE TABLAS

| Sección | Cantidad de Tablas |
|---------|-------------------|
| 1. Contadores y Personal | 3 |
| 2. Gestión de Retiros | 4 |
| 3. Gestión de Depósitos | 3 |
| 4. Premios de Torneos | 2 |
| 5. Usuarios Financieros | 4 |
| 6. Comisiones | 4 |
| 7. Facturación | 5 |
| 8. Conciliación Bancaria | 5 |
| 9. Reportes Financieros | 5 |
| 10. Auditoría Financiera | 4 |
| 11. Alertas Sospechosas | 4 |
| 12. Chat Interno | 4 |
| 13. Configuración del Contador | 3 |
| 14. Seguridad del Contador | 6 |
| 15. Métricas y Estadísticas | 4 |
| 16. Exportaciones | 2 |
| 17. Proveedores de Pago | 3 |
| 18. Gastos Operativos | 3 |
| 19. Cuentas Bancarias | 2 |
| 20. Notificaciones | 2 |
| 21. Perfil del Contador | 2 |
| 22. Tareas y Workflow | 4 |
| **TOTAL** | **78 tablas** |

---

## NOTAS ADICIONALES

1. **Relaciones**: Todas las tablas están relacionadas mediante claves foráneas para mantener la integridad referencial.

2. **Auditoría**: El sistema de auditoría registra todas las acciones financieras para cumplimiento regulatorio.

3. **Seguridad**: Se implementa autenticación de dos factores, gestión de sesiones y dispositivos de confianza.

4. **Conciliación**: El módulo de conciliación permite comparar balances esperados vs reales y resolver discrepancias.

5. **Alertas**: Sistema de detección de transacciones sospechosas con patrones configurables.

6. **Reportes**: Generación automática de reportes diarios, semanales y mensuales.

7. **Workflows**: Sistema de aprobación multinivel para transacciones que excedan ciertos límites.


---

## 23. REPORTES PERSONALIZADOS

### 23.1 custom_reports (Reportes Personalizados)
```sql
CREATE TABLE custom_reports (
    id SERIAL PRIMARY KEY,
    report_name VARCHAR(200) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    date_range_start DATE,
    date_range_end DATE,
    filters JSONB DEFAULT '{}',
    include_deposits BOOLEAN DEFAULT true,
    include_withdrawals BOOLEAN DEFAULT true,
    include_prizes BOOLEAN DEFAULT false,
    include_invoices BOOLEAN DEFAULT false,
    include_reconciliations BOOLEAN DEFAULT false,
    output_format VARCHAR(20) DEFAULT 'csv',
    generated_by INTEGER REFERENCES accountants(id),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(500),
    file_size INTEGER,
    download_count INTEGER DEFAULT 0
);
```

### 23.2 report_templates (Plantillas de Reportes)
```sql
CREATE TABLE report_templates (
    id SERIAL PRIMARY KEY,
    template_name VARCHAR(200) NOT NULL,
    template_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    report_type VARCHAR(100) NOT NULL,
    default_filters JSONB DEFAULT '{}',
    columns JSONB NOT NULL,
    grouping JSONB,
    sorting JSONB,
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES accountants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 23.3 report_schedules (Programación de Reportes)
```sql
CREATE TABLE report_schedules (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES report_templates(id),
    schedule_name VARCHAR(200) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    day_of_week INTEGER,
    day_of_month INTEGER,
    time_of_day TIME,
    recipients TEXT[],
    output_format VARCHAR(20) DEFAULT 'csv',
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    created_by INTEGER REFERENCES accountants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 24. FLUJO DE CAJA

### 24.1 cash_flow_records (Registros de Flujo de Caja)
```sql
CREATE TABLE cash_flow_records (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 24.2 cash_flow_projections (Proyecciones de Flujo de Caja)
```sql
CREATE TABLE cash_flow_projections (
    id SERIAL PRIMARY KEY,
    projection_date DATE NOT NULL,
    projected_inflow DECIMAL(15,2) DEFAULT 0,
    projected_outflow DECIMAL(15,2) DEFAULT 0,
    projected_balance DECIMAL(15,2),
    actual_inflow DECIMAL(15,2),
    actual_outflow DECIMAL(15,2),
    actual_balance DECIMAL(15,2),
    variance DECIMAL(15,2),
    notes TEXT,
    created_by INTEGER REFERENCES accountants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(projection_date)
);
```

---

## 25. ARCHIVOS COMPARTIDOS EN CHAT

### 25.1 chat_attachments (Archivos Adjuntos de Chat)
```sql
CREATE TABLE chat_attachments (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES internal_chat_messages(id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    file_path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500),
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    download_count INTEGER DEFAULT 0
);
```

### 25.2 chat_shared_files (Archivos Compartidos)
```sql
CREATE TABLE chat_shared_files (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    recipient_id INTEGER REFERENCES users(id),
    group_id INTEGER REFERENCES internal_chat_groups(id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    file_path VARCHAR(500) NOT NULL,
    description TEXT,
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);
```

---

## 26. BLOQUEOS Y RESTRICCIONES

### 26.1 user_blocks (Bloqueos de Usuarios)
```sql
CREATE TABLE user_blocks (
    id SERIAL PRIMARY KEY,
    blocker_id INTEGER REFERENCES users(id),
    blocked_id INTEGER REFERENCES users(id),
    block_type VARCHAR(50) DEFAULT 'chat',
    reason TEXT,
    blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unblocked_at TIMESTAMP,
    UNIQUE(blocker_id, blocked_id, block_type)
);
```

### 26.2 financial_restrictions (Restricciones Financieras)
```sql
CREATE TABLE financial_restrictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    restriction_type VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    applied_by INTEGER REFERENCES accountants(id),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    lifted_at TIMESTAMP,
    lifted_by INTEGER REFERENCES accountants(id),
    lift_reason TEXT,
    is_active BOOLEAN DEFAULT true
);
```

---

## 27. IMPUESTOS Y RETENCIONES

### 27.1 tax_configurations (Configuraciones de Impuestos)
```sql
CREATE TABLE tax_configurations (
    id SERIAL PRIMARY KEY,
    tax_name VARCHAR(100) NOT NULL,
    tax_code VARCHAR(50) UNIQUE NOT NULL,
    tax_rate DECIMAL(5,4) NOT NULL,
    applies_to VARCHAR(100),
    country VARCHAR(100),
    is_withholding BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 27.2 tax_withholdings (Retenciones de Impuestos)
```sql
CREATE TABLE tax_withholdings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    transaction_type VARCHAR(50) NOT NULL,
    transaction_id INTEGER,
    tax_config_id INTEGER REFERENCES tax_configurations(id),
    gross_amount DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,4) NOT NULL,
    tax_amount DECIMAL(15,2) NOT NULL,
    net_amount DECIMAL(15,2) NOT NULL,
    withheld_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reported BOOLEAN DEFAULT false,
    reported_at TIMESTAMP
);
```

### 27.3 tax_reports (Reportes de Impuestos)
```sql
CREATE TABLE tax_reports (
    id SERIAL PRIMARY KEY,
    report_period VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER,
    quarter INTEGER,
    total_gross DECIMAL(15,2) DEFAULT 0,
    total_tax_withheld DECIMAL(15,2) DEFAULT 0,
    total_net DECIMAL(15,2) DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',
    submitted_at TIMESTAMP,
    submitted_by INTEGER REFERENCES accountants(id),
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 28. MONEDAS Y TIPOS DE CAMBIO

### 28.1 currencies (Monedas)
```sql
CREATE TABLE currencies (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10),
    decimals INTEGER DEFAULT 2,
    is_crypto BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 28.2 exchange_rates (Tipos de Cambio)
```sql
CREATE TABLE exchange_rates (
    id SERIAL PRIMARY KEY,
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    rate DECIMAL(18,8) NOT NULL,
    source VARCHAR(100),
    effective_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 28.3 currency_conversions (Conversiones de Moneda)
```sql
CREATE TABLE currency_conversions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    from_amount DECIMAL(15,8) NOT NULL,
    to_amount DECIMAL(15,8) NOT NULL,
    exchange_rate DECIMAL(18,8) NOT NULL,
    fee_amount DECIMAL(15,8) DEFAULT 0,
    converted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reference_id INTEGER,
    reference_type VARCHAR(50)
);
```

---

## 29. LÍMITES Y UMBRALES

### 29.1 transaction_thresholds (Umbrales de Transacciones)
```sql
CREATE TABLE transaction_thresholds (
    id SERIAL PRIMARY KEY,
    threshold_name VARCHAR(200) NOT NULL,
    threshold_type VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    action_required VARCHAR(100),
    notification_required BOOLEAN DEFAULT true,
    approval_required BOOLEAN DEFAULT false,
    block_transaction BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 29.2 daily_limits_tracking (Seguimiento de Límites Diarios)
```sql
CREATE TABLE daily_limits_tracking (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    tracking_date DATE NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    daily_limit DECIMAL(15,2),
    used_amount DECIMAL(15,2) DEFAULT 0,
    remaining_amount DECIMAL(15,2),
    transaction_count INTEGER DEFAULT 0,
    last_transaction_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tracking_date, transaction_type)
);
```

---

## 30. NOTIFICACIONES SILENCIADAS

### 30.1 muted_notifications (Notificaciones Silenciadas)
```sql
CREATE TABLE muted_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    muted_user_id INTEGER REFERENCES users(id),
    muted_type VARCHAR(50) NOT NULL,
    muted_until TIMESTAMP,
    is_permanent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, muted_user_id, muted_type)
);
```

---

## ÍNDICES ADICIONALES

```sql
-- Índices adicionales para las nuevas tablas
CREATE INDEX idx_custom_reports_date ON custom_reports(date_range_start, date_range_end);
CREATE INDEX idx_cash_flow_date ON cash_flow_records(record_date);
CREATE INDEX idx_chat_attachments_message ON chat_attachments(message_id);
CREATE INDEX idx_tax_withholdings_user ON tax_withholdings(user_id);
CREATE INDEX idx_tax_withholdings_date ON tax_withholdings(withheld_at);
CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);
CREATE INDEX idx_daily_limits_user_date ON daily_limits_tracking(user_id, tracking_date);
CREATE INDEX idx_financial_restrictions_user ON financial_restrictions(user_id, is_active);
```

---

## RESUMEN ACTUALIZADO DE TABLAS

| Sección | Cantidad de Tablas |
|---------|-------------------|
| 1. Contadores y Personal | 3 |
| 2. Gestión de Retiros | 4 |
| 3. Gestión de Depósitos | 3 |
| 4. Premios de Torneos | 2 |
| 5. Usuarios Financieros | 4 |
| 6. Comisiones | 4 |
| 7. Facturación | 5 |
| 8. Conciliación Bancaria | 5 |
| 9. Reportes Financieros | 5 |
| 10. Auditoría Financiera | 4 |
| 11. Alertas Sospechosas | 4 |
| 12. Chat Interno | 4 |
| 13. Configuración del Contador | 3 |
| 14. Seguridad del Contador | 6 |
| 15. Métricas y Estadísticas | 4 |
| 16. Exportaciones | 2 |
| 17. Proveedores de Pago | 3 |
| 18. Gastos Operativos | 3 |
| 19. Cuentas Bancarias | 2 |
| 20. Notificaciones | 2 |
| 21. Perfil del Contador | 2 |
| 22. Tareas y Workflow | 4 |
| 23. Reportes Personalizados | 3 |
| 24. Flujo de Caja | 2 |
| 25. Archivos Compartidos | 2 |
| 26. Bloqueos y Restricciones | 2 |
| 27. Impuestos y Retenciones | 3 |
| 28. Monedas y Tipos de Cambio | 3 |
| 29. Límites y Umbrales | 2 |
| 30. Notificaciones Silenciadas | 1 |
| **TOTAL** | **96 tablas** |
