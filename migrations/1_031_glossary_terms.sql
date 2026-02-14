-- Términos del glosario
CREATE TABLE IF NOT EXISTS glossary_terms (
    id SERIAL PRIMARY KEY,
    term VARCHAR(100) NOT NULL,
    definition TEXT NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_glossary_terms_term ON glossary_terms(term);
CREATE INDEX IF NOT EXISTS idx_glossary_terms_category ON glossary_terms(category);
