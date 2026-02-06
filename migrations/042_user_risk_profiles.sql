-- Perfiles de riesgo de usuarios
CREATE TABLE IF NOT EXISTS user_risk_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    risk_score INTEGER DEFAULT 0,
    risk_level VARCHAR(20) DEFAULT 'low',
    total_alerts INTEGER DEFAULT 0,
    unresolved_alerts INTEGER DEFAULT 0,
    last_alert_at TIMESTAMP,
    flags JSONB DEFAULT '[]',
    notes TEXT,
    last_review_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES accountants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_risk_profiles_user ON user_risk_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_risk_profiles_level ON user_risk_profiles(risk_level);
CREATE INDEX IF NOT EXISTS idx_user_risk_profiles_score ON user_risk_profiles(risk_score);
