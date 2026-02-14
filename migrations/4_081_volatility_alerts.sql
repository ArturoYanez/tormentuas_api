-- Alertas de volatilidad
CREATE TABLE IF NOT EXISTS volatility_alerts (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    previous_level VARCHAR(20),
    new_level VARCHAR(20) NOT NULL,
    change_percentage DECIMAL(10,4),
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by INTEGER REFERENCES operators(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_volatility_alerts_symbol ON volatility_alerts(symbol);
CREATE INDEX IF NOT EXISTS idx_volatility_alerts_acknowledged ON volatility_alerts(is_acknowledged);
