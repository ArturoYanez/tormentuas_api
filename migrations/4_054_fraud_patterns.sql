-- Patrones de fraude detectados
CREATE TABLE IF NOT EXISTS fraud_patterns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    pattern_type VARCHAR(20) NOT NULL,
    detection_rules JSONB NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    auto_action VARCHAR(20) DEFAULT 'flag',
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES operators(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fraud_patterns_type ON fraud_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_fraud_patterns_active ON fraud_patterns(is_active);
