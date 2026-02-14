-- Plantillas de reportes
CREATE TABLE IF NOT EXISTS report_templates (
    id SERIAL PRIMARY KEY,
    template_name VARCHAR(200) NOT NULL,
    template_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    report_type VARCHAR(100) NOT NULL,
    default_filters JSONB DEFAULT '{}',
    columns JSONB NOT NULL,
    grouping JSONB,
    sorting JSONB,
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES accountants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_report_templates_code ON report_templates(template_code);
CREATE INDEX IF NOT EXISTS idx_report_templates_type ON report_templates(report_type);
