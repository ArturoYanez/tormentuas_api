-- Umbrales de alertas configurables
CREATE TABLE IF NOT EXISTS alert_thresholds (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    threshold_name VARCHAR(100) NOT NULL,
    threshold_value DECIMAL(18,8) NOT NULL,
    comparison VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES operators(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alert_thresholds_type ON alert_thresholds(alert_type);
CREATE INDEX IF NOT EXISTS idx_alert_thresholds_active ON alert_thresholds(is_active);
