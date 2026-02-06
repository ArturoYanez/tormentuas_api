-- Exportaciones de historial de trades
CREATE TABLE IF NOT EXISTS trade_history_exports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    format VARCHAR(10) NOT NULL,
    date_from DATE,
    date_to DATE,
    file_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trade_history_exports_user_id ON trade_history_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_history_exports_status ON trade_history_exports(status);
