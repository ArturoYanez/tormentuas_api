-- Configuración de volatilidad por activo
CREATE TABLE IF NOT EXISTS asset_volatility_settings (
    id SERIAL PRIMARY KEY,
    trading_pair_id INTEGER NOT NULL,
    volatility_level VARCHAR(20) DEFAULT 'medium',
    spread_adjustment DECIMAL(5,2),
    payout_adjustment DECIMAL(5,2),
    max_position_size DECIMAL(18,8),
    is_auto BOOLEAN DEFAULT TRUE,
    updated_by INTEGER REFERENCES operators(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_asset_volatility_settings_pair ON asset_volatility_settings(trading_pair_id);
