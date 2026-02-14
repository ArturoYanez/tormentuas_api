-- Países y restricciones
CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone_code VARCHAR(10),
    currency VARCHAR(10),
    is_allowed BOOLEAN DEFAULT TRUE,
    requires_kyc BOOLEAN DEFAULT TRUE,
    max_withdrawal_without_kyc DECIMAL(18,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);
CREATE INDEX IF NOT EXISTS idx_countries_is_allowed ON countries(is_allowed);
