-- Exportaciones programadas
CREATE TABLE IF NOT EXISTS scheduled_exports (
    id SERIAL PRIMARY KEY,
    export_type VARCHAR(100) NOT NULL,
    export_format VARCHAR(20) NOT NULL,
    schedule_type VARCHAR(20) NOT NULL,
    schedule_time TIME,
    schedule_day INTEGER,
    filters JSONB DEFAULT '{}',
    recipients TEXT[],
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    created_by INTEGER REFERENCES accountants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scheduled_exports_type ON scheduled_exports(export_type);
CREATE INDEX IF NOT EXISTS idx_scheduled_exports_active ON scheduled_exports(is_active);
