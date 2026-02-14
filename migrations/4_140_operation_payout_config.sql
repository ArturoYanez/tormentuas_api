-- Configuración de payout por operación
CREATE TABLE IF NOT EXISTS operation_payout_config (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    duration_seconds INTEGER NOT NULL,
    base_payout DECIMAL(5,2) NOT NULL,
    min_payout DECIMAL(5,2),
    max_payout DECIMAL(5,2),
    volatility_adjustment DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    updated_by INTEGER REFERENCES operators(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operation_payout_config_symbol ON operation_payout_config(symbol);
CREATE INDEX IF NOT EXISTS idx_operation_payout_config_active ON operation_payout_config(is_active);
