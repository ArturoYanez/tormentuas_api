-- Indicadores disponibles en la plataforma
CREATE TABLE IF NOT EXISTS chart_indicators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL,
    default_params JSONB,
    description TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Configuración de indicadores del usuario
CREATE TABLE IF NOT EXISTS user_indicator_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    indicator_id INTEGER REFERENCES chart_indicators(id),
    symbol VARCHAR(20),
    params JSONB,
    color VARCHAR(20),
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chart_indicators_category ON chart_indicators(category);
CREATE INDEX IF NOT EXISTS idx_user_indicator_settings_user_id ON user_indicator_settings(user_id);

-- Insertar indicadores por defecto
INSERT INTO chart_indicators (name, display_name, category, default_params) VALUES
('SMA', 'Media Móvil Simple', 'trend', '{"period": 20}'),
('EMA', 'Media Móvil Exponencial', 'trend', '{"period": 20}'),
('RSI', 'Índice de Fuerza Relativa', 'momentum', '{"period": 14}'),
('MACD', 'MACD', 'momentum', '{"fast": 12, "slow": 26, "signal": 9}'),
('BB', 'Bandas de Bollinger', 'volatility', '{"period": 20, "stdDev": 2}'),
('STOCH', 'Estocástico', 'momentum', '{"k": 14, "d": 3}'),
('ATR', 'Average True Range', 'volatility', '{"period": 14}'),
('VOL', 'Volumen', 'volume', '{}')
ON CONFLICT DO NOTHING;
