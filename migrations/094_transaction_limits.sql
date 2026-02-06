-- Límites de transacciones
CREATE TABLE IF NOT EXISTS transaction_limits (
    id SERIAL PRIMARY KEY,
    limit_type VARCHAR(50) NOT NULL,
    user_type VARCHAR(50),
    kyc_level INTEGER,
    daily_limit DECIMAL(15,2),
    weekly_limit DECIMAL(15,2),
    monthly_limit DECIMAL(15,2),
    single_transaction_min DECIMAL(15,2),
    single_transaction_max DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transaction_limits_type ON transaction_limits(limit_type);
CREATE INDEX IF NOT EXISTS idx_transaction_limits_user_type ON transaction_limits(user_type);
