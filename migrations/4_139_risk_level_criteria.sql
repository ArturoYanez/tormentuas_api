-- Criterios de nivel de riesgo
CREATE TABLE IF NOT EXISTS risk_level_criteria (
    id SERIAL PRIMARY KEY,
    risk_level VARCHAR(20) NOT NULL,
    criteria_name VARCHAR(100) NOT NULL,
    criteria_description TEXT,
    threshold_value DECIMAL(18,8),
    comparison_operator VARCHAR(10),
    weight DECIMAL(5,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES operators(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_risk_level_criteria_level ON risk_level_criteria(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_level_criteria_active ON risk_level_criteria(is_active);
