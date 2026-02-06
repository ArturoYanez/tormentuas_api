-- Direcciones de depósito
CREATE TABLE IF NOT EXISTS deposit_addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    currency VARCHAR(10) NOT NULL,
    network VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    memo VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    total_received DECIMAL(15,2) DEFAULT 0,
    last_deposit_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_deposit_addresses_user ON deposit_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_addresses_currency ON deposit_addresses(currency);
CREATE INDEX IF NOT EXISTS idx_deposit_addresses_address ON deposit_addresses(address);
