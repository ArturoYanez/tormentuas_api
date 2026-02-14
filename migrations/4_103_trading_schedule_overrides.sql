-- Sobrescrituras de horarios de trading
CREATE TABLE IF NOT EXISTS trading_schedule_overrides (
    id SERIAL PRIMARY KEY,
    trading_pair_id INTEGER NOT NULL,
    operator_id INTEGER REFERENCES operators(id),
    override_type VARCHAR(20) NOT NULL,
    original_start TIME,
    original_end TIME,
    new_start TIME,
    new_end TIME,
    reason TEXT,
    effective_date DATE,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trading_schedule_overrides_pair ON trading_schedule_overrides(trading_pair_id);
