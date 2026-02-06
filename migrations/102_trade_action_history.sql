-- Historial de acciones en operaciones
CREATE TABLE IF NOT EXISTS trade_action_history (
    id SERIAL PRIMARY KEY,
    trade_id INTEGER NOT NULL,
    operator_id INTEGER REFERENCES operators(id),
    action VARCHAR(50) NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    reason TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trade_action_history_trade ON trade_action_history(trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_action_history_operator ON trade_action_history(operator_id);
