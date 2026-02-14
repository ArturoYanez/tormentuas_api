-- Perfiles financieros de usuarios
CREATE TABLE IF NOT EXISTS user_financial_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
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

CREATE INDEX IF NOT EXISTS idx_user_financial_profiles_user ON user_financial_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_financial_profiles_risk ON user_financial_profiles(risk_level);
CREATE INDEX IF NOT EXISTS idx_user_financial_profiles_status ON user_financial_profiles(financial_status);
