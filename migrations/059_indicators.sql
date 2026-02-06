-- Indicadores disponibles
CREATE TABLE IF NOT EXISTS indicators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50),
    default_settings JSONB,
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indicadores guardados por usuario
CREATE TABLE IF NOT EXISTS user_indicators (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    indicator_id INTEGER REFERENCES indicators(id) ON DELETE CASCADE,
    symbol VARCHAR(20),
    settings JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_indicators_user_id ON user_indicators(user_id);
CREATE INDEX IF NOT EXISTS idx_indicators_category ON indicators(category);

-- Insertar indicadores por defecto
INSERT INTO indicators (name, code, category, default_settings) VALUES
('Media Móvil Simple', 'SMA', 'trend', '{"period": 20}'),
('Media Móvil Exponencial', 'EMA', 'trend', '{"period": 20}'),
('RSI', 'RSI', 'oscillator', '{"period": 14}'),
('MACD', 'MACD', 'oscillator', '{"fast": 12, "slow": 26, "signal": 9}'),
('Bandas de Bollinger', 'BB', 'volatility', '{"period": 20, "stdDev": 2}'),
('Volumen', 'VOL', 'volume', '{}'),
('ATR', 'ATR', 'volatility', '{"period": 14}'),
('Estocástico', 'STOCH', 'oscillator', '{"k": 14, "d": 3}')
ON CONFLICT DO NOTHING;
