-- Patrones de trading detectados
CREATE TABLE IF NOT EXISTS trading_patterns (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pattern_type VARCHAR(50) NOT NULL,
    pattern_description TEXT,
    confidence_score DECIMAL(5,2),
    trades_involved JSONB DEFAULT '[]',
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    reviewed_by INTEGER REFERENCES operators(id),
    review_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_trading_patterns_user ON trading_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_patterns_status ON trading_patterns(status);
