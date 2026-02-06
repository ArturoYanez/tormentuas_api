-- Detecciones de fraude
CREATE TABLE IF NOT EXISTS fraud_detections (
    id SERIAL PRIMARY KEY,
    pattern_id INTEGER REFERENCES fraud_patterns(id),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    trade_id INTEGER,
    confidence_score DECIMAL(5,2),
    evidence JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending',
    reviewed_by INTEGER REFERENCES operators(id),
    action_taken VARCHAR(100),
    notes TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fraud_detections_user ON fraud_detections(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_detections_status ON fraud_detections(status);
CREATE INDEX IF NOT EXISTS idx_fraud_detections_date ON fraud_detections(detected_at);
