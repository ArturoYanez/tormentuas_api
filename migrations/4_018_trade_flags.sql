-- Marcadores de operaciones sospechosas
CREATE TABLE IF NOT EXISTS trade_flags (
    id SERIAL PRIMARY KEY,
    trade_id INTEGER NOT NULL,
    operator_id INTEGER REFERENCES operators(id),
    flag_type VARCHAR(20) NOT NULL,
    reason TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by INTEGER REFERENCES operators(id),
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'trade_flags' AND column_name = 'is_resolved'
    ) THEN
        ALTER TABLE trade_flags ADD COLUMN is_resolved BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_trade_flags_trade ON trade_flags(trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_flags_resolved ON trade_flags(is_resolved);
CREATE INDEX IF NOT EXISTS idx_trade_flags_severity ON trade_flags(severity);
