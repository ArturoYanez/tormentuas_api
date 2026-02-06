-- Estado de verificación de usuarios
CREATE TABLE IF NOT EXISTS user_verification_status (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    identity_verified BOOLEAN DEFAULT FALSE,
    address_verified BOOLEAN DEFAULT FALSE,
    verification_level INTEGER DEFAULT 0,
    last_verification_at TIMESTAMP,
    verified_by INTEGER REFERENCES operators(id)
);

CREATE INDEX IF NOT EXISTS idx_user_verification_status_user ON user_verification_status(user_id);
