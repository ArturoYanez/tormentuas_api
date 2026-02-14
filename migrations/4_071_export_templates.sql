-- Plantillas de exportación
CREATE TABLE IF NOT EXISTS export_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    export_type VARCHAR(20) NOT NULL,
    columns JSONB NOT NULL,
    default_filters JSONB DEFAULT '{}',
    format VARCHAR(20) DEFAULT 'csv',
    is_system BOOLEAN DEFAULT FALSE,
    created_by INTEGER REFERENCES operators(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_export_templates_type ON export_templates(export_type);
