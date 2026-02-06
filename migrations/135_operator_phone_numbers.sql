-- Números de teléfono de operadores
CREATE TABLE IF NOT EXISTS operator_phone_numbers (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    phone_type VARCHAR(20) DEFAULT 'mobile',
    country_code VARCHAR(5),
    is_verified BOOLEAN DEFAULT FALSE,
    is_primary BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_phone_numbers_operator ON operator_phone_numbers(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_phone_numbers_primary ON operator_phone_numbers(is_primary);
