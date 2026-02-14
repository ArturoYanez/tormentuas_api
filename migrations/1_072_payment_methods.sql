-- Métodos de pago disponibles
CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    symbol VARCHAR(10),
    network VARCHAR(20),
    icon_url VARCHAR(500),
    min_deposit DECIMAL(18,8),
    max_deposit DECIMAL(18,8),
    min_withdrawal DECIMAL(18,8),
    max_withdrawal DECIMAL(18,8),
    deposit_fee DECIMAL(18,8) DEFAULT 0,
    withdrawal_fee DECIMAL(18,8) DEFAULT 0,
    processing_time VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    position INTEGER DEFAULT 0
);

-- Direcciones de pago guardadas del usuario
CREATE TABLE IF NOT EXISTS user_payment_addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    payment_method_id INTEGER REFERENCES payment_methods(id),
    address VARCHAR(200) NOT NULL,
    label VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_is_active ON payment_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_user_payment_addresses_user_id ON user_payment_addresses(user_id);
