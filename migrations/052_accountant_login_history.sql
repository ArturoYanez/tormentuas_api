-- Historial de login del contador
CREATE TABLE IF NOT EXISTS accountant_login_history (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_accountant_login_history_accountant ON accountant_login_history(accountant_id);
CREATE INDEX IF NOT EXISTS idx_accountant_login_history_date ON accountant_login_history(login_at);
