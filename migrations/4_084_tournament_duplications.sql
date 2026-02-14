-- Duplicaciones de torneos
CREATE TABLE IF NOT EXISTS tournament_duplications (
    id SERIAL PRIMARY KEY,
    original_tournament_id INTEGER NOT NULL,
    new_tournament_id INTEGER NOT NULL,
    operator_id INTEGER REFERENCES operators(id),
    duplicated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournament_duplications_original ON tournament_duplications(original_tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_duplications_operator ON tournament_duplications(operator_id);
