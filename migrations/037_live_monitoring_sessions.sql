-- Sesiones de monitoreo en vivo
CREATE TABLE IF NOT EXISTS live_monitoring_sessions (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    monitoring_type VARCHAR(20) NOT NULL,
    filters JSONB DEFAULT '{}',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_live_monitoring_sessions_operator ON live_monitoring_sessions(operator_id);
CREATE INDEX IF NOT EXISTS idx_live_monitoring_sessions_type ON live_monitoring_sessions(monitoring_type);
