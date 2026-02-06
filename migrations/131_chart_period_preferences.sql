-- Preferencias de período de gráficos
CREATE TABLE IF NOT EXISTS chart_period_preferences (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE UNIQUE,
    default_period VARCHAR(20) DEFAULT 'day',
    operations_chart_period VARCHAR(20) DEFAULT 'day',
    volume_chart_period VARCHAR(20) DEFAULT 'day',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chart_period_preferences_operator ON chart_period_preferences(operator_id);
