-- Balances de proveedores de pago
CREATE TABLE IF NOT EXISTS payment_provider_balances (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES payment_providers(id) ON DELETE CASCADE,
    currency VARCHAR(10) NOT NULL,
    available_balance DECIMAL(15,2) DEFAULT 0,
    pending_balance DECIMAL(15,2) DEFAULT 0,
    reserved_balance DECIMAL(15,2) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider_id, currency)
);

CREATE INDEX IF NOT EXISTS idx_payment_provider_balances_provider ON payment_provider_balances(provider_id);
