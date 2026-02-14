-- Ajustes de balance realizados por operadores
CREATE TABLE IF NOT EXISTS operator_balance_adjustments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id),
    wallet_id INTEGER,
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(18,8) NOT NULL,
    previous_balance DECIMAL(18,8),
    new_balance DECIMAL(18,8),
    reason TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'other',
    approved_by INTEGER REFERENCES operators(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_balance_adjustments_user ON operator_balance_adjustments(user_id);
CREATE INDEX IF NOT EXISTS idx_operator_balance_adjustments_operator ON operator_balance_adjustments(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_balance_adjustments_date ON operator_balance_adjustments(created_at);
