-- Patrones sospechosos
CREATE TABLE IF NOT EXISTS suspicious_patterns (
    id SERIAL PRIMARY KEY,
    pattern_name VARCHAR(200) NOT NULL,
    pattern_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    detection_rules JSONB NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    auto_flag BOOLEAN DEFAULT true,
    auto_block BOOLEAN DEFAULT false,
    notification_required BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suspicious_patterns_code ON suspicious_patterns(pattern_code);
CREATE INDEX IF NOT EXISTS idx_suspicious_patterns_active ON suspicious_patterns(is_active);
