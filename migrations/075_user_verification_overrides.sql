-- Sobrescrituras de verificación de usuarios
CREATE TABLE IF NOT EXISTS user_verification_overrides (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id),
    verification_type VARCHAR(20) NOT NULL,
    previous_status BOOLEAN,
    new_status BOOLEAN NOT NULL,
    reason TEXT,
    approved_by INTEGER REFERENCES operators(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_verification_overrides_user ON user_verification_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verification_overrides_type ON user_verification_overrides(verification_type);
