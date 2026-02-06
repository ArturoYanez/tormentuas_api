-- Resúmenes financieros diarios
CREATE TABLE IF NOT EXISTS daily_financial_summaries (
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

CREATE INDEX IF NOT EXISTS idx_daily_financial_summaries_date ON daily_financial_summaries(summary_date);
