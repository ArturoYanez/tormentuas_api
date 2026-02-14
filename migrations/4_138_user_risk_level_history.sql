-- Historial de nivel de riesgo de usuarios
CREATE TABLE IF NOT EXISTS user_risk_level_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    previous_level VARCHAR(20),
    new_level VARCHAR(20) NOT NULL,
    change_reason TEXT,
    risk_factors JSONB DEFAULT '{}',
    changed_by INTEGER REFERENCES operators(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_risk_level_history_user ON user_risk_level_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_risk_level_history_level ON user_risk_level_history(new_level);
