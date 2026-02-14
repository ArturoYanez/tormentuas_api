-- Resumen financiero de usuarios
CREATE TABLE IF NOT EXISTS user_financial_summary (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    total_deposits DECIMAL(18,8) DEFAULT 0,
    total_withdrawals DECIMAL(18,8) DEFAULT 0,
    pending_deposits DECIMAL(18,8) DEFAULT 0,
    pending_withdrawals DECIMAL(18,8) DEFAULT 0,
    net_deposits DECIMAL(18,8) DEFAULT 0,
    first_deposit_at TIMESTAMP,
    last_deposit_at TIMESTAMP,
    first_withdrawal_at TIMESTAMP,
    last_withdrawal_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_financial_summary_user ON user_financial_summary(user_id);
