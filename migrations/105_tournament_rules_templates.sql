-- Plantillas de reglas de torneos
CREATE TABLE IF NOT EXISTS tournament_rules_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    rules_text TEXT NOT NULL,
    category VARCHAR(20) DEFAULT 'mixed',
    is_default BOOLEAN DEFAULT FALSE,
    created_by INTEGER REFERENCES operators(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournament_rules_templates_category ON tournament_rules_templates(category);
