-- Distribución de comisiones
CREATE TABLE IF NOT EXISTS commission_distributions (
    id SERIAL PRIMARY KEY,
    commission_id INTEGER REFERENCES commissions(id) ON DELETE CASCADE,
    recipient_type VARCHAR(50) NOT NULL,
    recipient_id INTEGER,
    amount DECIMAL(15,2) NOT NULL,
    percentage DECIMAL(5,4),
    status VARCHAR(20) DEFAULT 'pending',
    distributed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_commission_distributions_commission ON commission_distributions(commission_id);
CREATE INDEX IF NOT EXISTS idx_commission_distributions_status ON commission_distributions(status);
