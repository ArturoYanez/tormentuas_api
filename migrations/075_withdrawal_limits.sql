-- Límites de retiro por nivel de usuario
CREATE TABLE IF NOT EXISTS withdrawal_limits (
    id SERIAL PRIMARY KEY,
    level_id INTEGER REFERENCES user_levels(id),
    daily_limit DECIMAL(18,8),
    weekly_limit DECIMAL(18,8),
    monthly_limit DECIMAL(18,8),
    single_transaction_limit DECIMAL(18,8)
);

-- Uso de límites de retiro del usuario
CREATE TABLE IF NOT EXISTS user_withdrawal_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    daily_used DECIMAL(18,8) DEFAULT 0,
    weekly_used DECIMAL(18,8) DEFAULT 0,
    monthly_used DECIMAL(18,8) DEFAULT 0,
    last_reset_daily DATE,
    last_reset_weekly DATE,
    last_reset_monthly DATE
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_limits_level_id ON withdrawal_limits(level_id);
CREATE INDEX IF NOT EXISTS idx_user_withdrawal_usage_user_id ON user_withdrawal_usage(user_id);
