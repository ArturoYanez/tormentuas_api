-- Pagos de entrada a torneos
CREATE TABLE IF NOT EXISTS tournament_entry_payments (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount_paid DECIMAL(18,8) NOT NULL,
    discount_applied DECIMAL(18,8) DEFAULT 0,
    discount_type VARCHAR(50),
    payment_method VARCHAR(50),
    transaction_id INTEGER,
    status VARCHAR(20) DEFAULT 'pending',
    paid_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournament_entry_payments_tournament ON tournament_entry_payments(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_entry_payments_user ON tournament_entry_payments(user_id);
