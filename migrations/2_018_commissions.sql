-- Comisiones
CREATE TABLE IF NOT EXISTS commissions (
    id SERIAL PRIMARY KEY,
    commission_type_id INTEGER REFERENCES commission_types(id),
    source_type VARCHAR(50) NOT NULL,
    source_id INTEGER,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    percentage_applied DECIMAL(5,4),
    base_amount DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'USD',
    description TEXT,
    status VARCHAR(20) DEFAULT 'collected',
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'commissions' AND column_name = 'collected_at'
    ) THEN
        ALTER TABLE commissions ADD COLUMN collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_commissions_type ON commissions(commission_type_id);
CREATE INDEX IF NOT EXISTS idx_commissions_user ON commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_date ON commissions(collected_at);
