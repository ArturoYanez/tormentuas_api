-- Tabla de contadores
CREATE TABLE IF NOT EXISTS accountants (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_accountants_user_id ON accountants(user_id);
CREATE INDEX IF NOT EXISTS idx_accountants_status ON accountants(status);
