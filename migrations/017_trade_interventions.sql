-- Intervenciones del operador en operaciones
CREATE TABLE IF NOT EXISTS trade_interventions (
    id SERIAL PRIMARY KEY,
    trade_id INTEGER NOT NULL,
    operator_id INTEGER REFERENCES operators(id),
    action VARCHAR(20) NOT NULL,
    original_result VARCHAR(20),
    new_result VARCHAR(20),
    original_profit DECIMAL(18,8),
    new_profit DECIMAL(18,8),
    reason TEXT NOT NULL,
    approved_by INTEGER REFERENCES operators(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trade_interventions_trade ON trade_interventions(trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_interventions_operator ON trade_interventions(operator_id);
CREATE INDEX IF NOT EXISTS idx_trade_interventions_date ON trade_interventions(created_at);
