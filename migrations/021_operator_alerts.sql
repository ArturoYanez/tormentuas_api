-- Alertas para operadores
CREATE TABLE IF NOT EXISTS operator_alerts (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    title VARCHAR(200) NOT NULL,
    message TEXT,
    user_id INTEGER REFERENCES users(id),
    trade_id INTEGER,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    assigned_to INTEGER REFERENCES operators(id),
    resolved_by INTEGER REFERENCES operators(id),
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_alerts_type ON operator_alerts(type);
CREATE INDEX IF NOT EXISTS idx_operator_alerts_severity ON operator_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_operator_alerts_resolved ON operator_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_operator_alerts_assigned ON operator_alerts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_operator_alerts_date ON operator_alerts(created_at);
