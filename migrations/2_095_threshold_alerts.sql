-- Alertas de umbrales
CREATE TABLE IF NOT EXISTS threshold_alerts (
    id SERIAL PRIMARY KEY,
    alert_name VARCHAR(200) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    metric VARCHAR(100) NOT NULL,
    threshold_value DECIMAL(15,2) NOT NULL,
    comparison_operator VARCHAR(10) NOT NULL,
    notification_channels TEXT[],
    recipients TEXT[],
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMP,
    trigger_count INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES accountants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_threshold_alerts_type ON threshold_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_threshold_alerts_active ON threshold_alerts(is_active);
