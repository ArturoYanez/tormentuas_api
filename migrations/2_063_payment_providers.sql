-- Proveedores de pago
CREATE TABLE IF NOT EXISTS payment_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    provider_type VARCHAR(50) NOT NULL,
    supported_currencies TEXT[],
    supported_networks TEXT[],
    api_endpoint VARCHAR(500),
    api_credentials JSONB,
    fee_structure JSONB,
    min_transaction DECIMAL(15,2),
    max_transaction DECIMAL(15,2),
    daily_limit DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active',
    last_health_check TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_providers_code ON payment_providers(code);
CREATE INDEX IF NOT EXISTS idx_payment_providers_active ON payment_providers(is_active);
