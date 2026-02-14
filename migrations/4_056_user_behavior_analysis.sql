-- Análisis de comportamiento de usuarios
CREATE TABLE IF NOT EXISTS user_behavior_analysis (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL,
    metrics JSONB DEFAULT '{}',
    anomalies JSONB DEFAULT '[]',
    risk_score DECIMAL(5,2),
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_behavior_analysis_user ON user_behavior_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_analysis_type ON user_behavior_analysis(analysis_type);
