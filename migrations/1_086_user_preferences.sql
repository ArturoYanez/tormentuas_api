-- Preferencias adicionales del usuario
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    default_chart_type VARCHAR(20) DEFAULT 'candles',
    default_timeframe VARCHAR(10) DEFAULT '1m',
    default_trade_amount DECIMAL(18,8) DEFAULT 10,
    default_trade_duration INTEGER DEFAULT 60,
    one_click_trading BOOLEAN DEFAULT FALSE,
    show_profit_in_percentage BOOLEAN DEFAULT FALSE,
    chart_theme VARCHAR(20) DEFAULT 'dark',
    grid_visible BOOLEAN DEFAULT TRUE,
    volume_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
