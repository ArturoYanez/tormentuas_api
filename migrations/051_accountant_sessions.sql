-- Sesiones del contador
CREATE TABLE IF NOT EXISTS accountant_sessions (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_accountant_sessions_accountant ON accountant_sessions(accountant_id);
CREATE INDEX IF NOT EXISTS idx_accountant_sessions_token ON accountant_sessions(session_token);
