-- Reglas específicas de torneos
CREATE TABLE IF NOT EXISTS tournament_rules (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    rule_text VARCHAR(500) NOT NULL,
    position INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_tournament_rules_tournament_id ON tournament_rules(tournament_id);
