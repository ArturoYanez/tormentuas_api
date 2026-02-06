-- Chart Indicators - Indicadores configurados por el usuario
CREATE TABLE IF NOT EXISTS chart_indicators (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) DEFAULT '*', -- * para todos los símbolos
    name VARCHAR(30) NOT NULL, -- SMA, EMA, RSI, MACD, Bollinger, etc.
    settings JSONB DEFAULT '{}',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, symbol, name)
);

CREATE INDEX IF NOT EXISTS idx_chart_indicators_user_symbol ON chart_indicators(user_id, symbol);
