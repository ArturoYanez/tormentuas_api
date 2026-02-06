-- Autenticación de dos factores del contador
CREATE TABLE IF NOT EXISTS accountant_two_factor (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) ON DELETE CASCADE UNIQUE,
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

CREATE INDEX IF NOT EXISTS idx_accountant_two_factor_accountant ON accountant_two_factor(accountant_id);
