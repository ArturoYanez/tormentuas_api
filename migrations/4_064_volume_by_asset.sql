-- Volumen por activo para gráficos
CREATE TABLE IF NOT EXISTS volume_by_asset (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    period VARCHAR(20) NOT NULL,
    period_start TIMESTAMP NOT NULL,
    volume DECIMAL(18,8) DEFAULT 0,
    trades_count INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_volume_by_asset_symbol ON volume_by_asset(symbol, period);
CREATE INDEX IF NOT EXISTS idx_volume_by_asset_date ON volume_by_asset(period_start);
