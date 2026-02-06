-- Ajustes de payout por operador
CREATE TABLE IF NOT EXISTS payout_adjustments (
    id SERIAL PRIMARY KEY,
    trading_pair_id INTEGER NOT NULL,
    operator_id INTEGER REFERENCES operators(id),
    previous_payout DECIMAL(5,2),
    new_payout DECIMAL(5,2) NOT NULL,
    reason TEXT,
    approved_by INTEGER REFERENCES operators(id),
    effective_from TIMESTAMP,
    effective_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payout_adjustments_pair ON payout_adjustments(trading_pair_id);
CREATE INDEX IF NOT EXISTS idx_payout_adjustments_operator ON payout_adjustments(operator_id);
