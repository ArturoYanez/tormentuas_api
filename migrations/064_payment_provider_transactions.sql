-- Transacciones de proveedores de pago
CREATE TABLE IF NOT EXISTS payment_provider_transactions (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES payment_providers(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL,
    internal_reference VARCHAR(100),
    external_reference VARCHAR(255),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10),
    fee_amount DECIMAL(15,4),
    net_amount DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'pending',
    response_code VARCHAR(50),
    response_message TEXT,
    raw_response JSONB,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_provider_transactions_provider ON payment_provider_transactions(provider_id);
CREATE INDEX IF NOT EXISTS idx_payment_provider_transactions_status ON payment_provider_transactions(status);
