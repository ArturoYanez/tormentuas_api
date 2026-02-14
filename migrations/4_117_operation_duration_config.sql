-- Configuración de duraciones de operaciones
CREATE TABLE IF NOT EXISTS operation_duration_config (
    id SERIAL PRIMARY KEY,
    trading_pair_id INTEGER NOT NULL,
    duration_seconds INTEGER NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    payout_adjustment DECIMAL(5,2),
    min_amount DECIMAL(18,8),
    max_amount DECIMAL(18,8),
    configured_by INTEGER REFERENCES operators(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operation_duration_config_pair ON operation_duration_config(trading_pair_id);
