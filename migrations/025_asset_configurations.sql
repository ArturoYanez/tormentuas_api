-- Configuraciones de activos por operador
CREATE TABLE IF NOT EXISTS asset_configurations (
    id SERIAL PRIMARY KEY,
    trading_pair_id INTEGER,
    operator_id INTEGER REFERENCES operators(id),
    payout_percentage DECIMAL(5,2),
    min_investment DECIMAL(18,8),
    max_investment DECIMAL(18,8),
    is_enabled BOOLEAN DEFAULT TRUE,
    trading_hours_start TIME,
    trading_hours_end TIME,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_asset_configurations_pair ON asset_configurations(trading_pair_id);
CREATE INDEX IF NOT EXISTS idx_asset_configurations_operator ON asset_configurations(operator_id);
