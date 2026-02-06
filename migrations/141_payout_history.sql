-- Historial de cambios de payout
CREATE TABLE IF NOT EXISTS payout_history (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    previous_payout DECIMAL(5,2),
    new_payout DECIMAL(5,2) NOT NULL,
    change_reason TEXT,
    changed_by INTEGER REFERENCES operators(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    effective_from TIMESTAMP,
    effective_until TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payout_history_symbol ON payout_history(symbol);
CREATE INDEX IF NOT EXISTS idx_payout_history_date ON payout_history(changed_at);
