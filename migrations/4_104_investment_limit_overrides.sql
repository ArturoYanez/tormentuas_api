-- Sobrescrituras de límites de inversión
CREATE TABLE IF NOT EXISTS investment_limit_overrides (
    id SERIAL PRIMARY KEY,
    trading_pair_id INTEGER NOT NULL,
    operator_id INTEGER REFERENCES operators(id),
    previous_min DECIMAL(18,8),
    previous_max DECIMAL(18,8),
    new_min DECIMAL(18,8),
    new_max DECIMAL(18,8),
    reason TEXT,
    approved_by INTEGER REFERENCES operators(id),
    effective_from TIMESTAMP,
    effective_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_investment_limit_overrides_pair ON investment_limit_overrides(trading_pair_id);
