-- Detalles de flags en operaciones
CREATE TABLE IF NOT EXISTS operation_flag_details (
    id SERIAL PRIMARY KEY,
    trade_id INTEGER NOT NULL,
    flag_reason_id INTEGER REFERENCES flag_reasons(id),
    custom_reason TEXT,
    evidence JSONB DEFAULT '{}',
    flagged_by INTEGER REFERENCES operators(id),
    flagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed BOOLEAN DEFAULT FALSE,
    reviewed_by INTEGER REFERENCES operators(id),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    action_taken VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_operation_flag_details_trade ON operation_flag_details(trade_id);
CREATE INDEX IF NOT EXISTS idx_operation_flag_details_flagged_by ON operation_flag_details(flagged_by);
