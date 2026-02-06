-- Datos de gráficos del dashboard
CREATE TABLE IF NOT EXISTS dashboard_chart_data (
    id SERIAL PRIMARY KEY,
    chart_type VARCHAR(20) NOT NULL,
    period VARCHAR(20) NOT NULL,
    data_point TIMESTAMP NOT NULL,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    volume DECIMAL(18,8) DEFAULT 0,
    revenue DECIMAL(18,8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dashboard_chart_data_type ON dashboard_chart_data(chart_type, period);
CREATE INDEX IF NOT EXISTS idx_dashboard_chart_data_date ON dashboard_chart_data(data_point);
