-- Historial de cancelaciones de operaciones
CREATE TABLE IF NOT EXISTS trade_cancellations (
    id SERIAL PRIMARY KEY,
    trade_id INTEGER NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id),
    original_amount DECIMAL(18,8),
    refunded_amount DECIMAL(18,8),
    reason TEXT NOT NULL,
    cancellation_type VARCHAR(20) DEFAULT 'operator_decision',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trade_cancellations_trade ON trade_cancellations(trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_cancellations_user ON trade_cancellations(user_id);
