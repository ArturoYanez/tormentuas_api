-- Resultados forzados de operaciones
CREATE TABLE IF NOT EXISTS forced_trade_results (
    id SERIAL PRIMARY KEY,
    trade_id INTEGER NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id),
    original_result VARCHAR(20),
    forced_result VARCHAR(20) NOT NULL,
    original_profit DECIMAL(18,8),
    forced_profit DECIMAL(18,8),
    reason TEXT NOT NULL,
    approved_by INTEGER REFERENCES operators(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_forced_trade_results_trade ON forced_trade_results(trade_id);
CREATE INDEX IF NOT EXISTS idx_forced_trade_results_user ON forced_trade_results(user_id);
