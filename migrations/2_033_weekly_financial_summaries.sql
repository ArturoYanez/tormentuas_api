-- Resúmenes financieros semanales
CREATE TABLE IF NOT EXISTS weekly_financial_summaries (
    id SERIAL PRIMARY KEY,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    year INTEGER NOT NULL,
    week_number INTEGER NOT NULL,
    total_deposits DECIMAL(15,2) DEFAULT 0,
    total_withdrawals DECIMAL(15,2) DEFAULT 0,
    total_commissions DECIMAL(15,2) DEFAULT 0,
    total_prizes DECIMAL(15,2) DEFAULT 0,
    net_revenue DECIMAL(15,2) DEFAULT 0,
    gross_profit DECIMAL(15,2) DEFAULT 0,
    average_daily_volume DECIMAL(15,2) DEFAULT 0,
    peak_day DATE,
    peak_volume DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, week_number)
);

CREATE INDEX IF NOT EXISTS idx_weekly_financial_summaries_year ON weekly_financial_summaries(year, week_number);
