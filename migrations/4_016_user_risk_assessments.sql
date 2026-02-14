-- Evaluaciones de riesgo de usuarios
CREATE TABLE IF NOT EXISTS user_risk_assessments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id),
    previous_level VARCHAR(20),
    new_level VARCHAR(20) NOT NULL,
    factors JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_risk_assessments_user ON user_risk_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_risk_assessments_level ON user_risk_assessments(new_level);
