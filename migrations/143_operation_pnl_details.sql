-- Detalles de PnL por operación
CREATE TABLE IF NOT EXISTS operation_pnl_details (
    id SERIAL PRIMARY KEY,
    trade_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    investment_amount DECIMAL(18,8) NOT NULL,
    payout_percentage DECIMAL(5,2),
    gross_pnl DECIMAL(18,8),
    net_pnl DECIMAL(18,8),
    platform_profit DECIMAL(18,8),
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operation_pnl_details_trade ON operation_pnl_details(trade_id);
CREATE INDEX IF NOT EXISTS idx_operation_pnl_details_user ON operation_pnl_details(user_id);
