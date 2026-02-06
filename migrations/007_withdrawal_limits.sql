-- Límites de retiro
CREATE TABLE IF NOT EXISTS withdrawal_limits (
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

CREATE INDEX IF NOT EXISTS idx_withdrawal_limits_user_type ON withdrawal_limits(user_type);
CREATE INDEX IF NOT EXISTS idx_withdrawal_limits_kyc ON withdrawal_limits(kyc_level);
