-- Widgets del dashboard del operador
CREATE TABLE IF NOT EXISTS operator_dashboard_widgets (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    widget_type VARCHAR(50) NOT NULL,
    position INTEGER DEFAULT 0,
    size VARCHAR(20) DEFAULT 'medium',
    config JSONB DEFAULT '{}',
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_dashboard_widgets_operator ON operator_dashboard_widgets(operator_id);
