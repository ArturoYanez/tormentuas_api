-- Estado general de verificación KYC
CREATE TABLE IF NOT EXISTS kyc_status (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    status VARCHAR(20) DEFAULT 'none',
    identity_verified BOOLEAN DEFAULT FALSE,
    address_verified BOOLEAN DEFAULT FALSE,
    selfie_verified BOOLEAN DEFAULT FALSE,
    verification_level INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kyc_status_user_id ON kyc_status(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status_status ON kyc_status(status);
