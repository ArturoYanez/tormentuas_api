-- Pagos de premios
CREATE TABLE IF NOT EXISTS prize_payments (
    id SERIAL PRIMARY KEY,
    prize_id INTEGER REFERENCES tournament_prizes(id) ON DELETE CASCADE,
    accountant_id INTEGER REFERENCES accountants(id),
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50),
    destination_wallet VARCHAR(255),
    tx_hash VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    processed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prize_payments_prize ON prize_payments(prize_id);
CREATE INDEX IF NOT EXISTS idx_prize_payments_accountant ON prize_payments(accountant_id);
CREATE INDEX IF NOT EXISTS idx_prize_payments_status ON prize_payments(status);
