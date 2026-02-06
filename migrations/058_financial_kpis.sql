-- KPIs financieros
CREATE TABLE IF NOT EXISTS financial_kpis (
    id SERIAL PRIMARY KEY,
    kpi_date DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL,
    revenue DECIMAL(15,2) DEFAULT 0,
    expenses DECIMAL(15,2) DEFAULT 0,
    gross_margin DECIMAL(5,2),
    net_margin DECIMAL(5,2),
    customer_acquisition_cost DECIMAL(15,2),
    lifetime_value DECIMAL(15,2),
    churn_rate DECIMAL(5,2),
    deposit_to_withdrawal_ratio DECIMAL(5,2),
    average_transaction_value DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(kpi_date, period_type)
);

CREATE INDEX IF NOT EXISTS idx_financial_kpis_date ON financial_kpis(kpi_date);
CREATE INDEX IF NOT EXISTS idx_financial_kpis_period ON financial_kpis(period_type);
