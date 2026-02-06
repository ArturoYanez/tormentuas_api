-- Historial de cambios en reglas de torneos
CREATE TABLE IF NOT EXISTS tournament_rules_history (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    previous_rules TEXT,
    new_rules TEXT NOT NULL,
    changed_by INTEGER REFERENCES operators(id),
    reason TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournament_rules_history_tournament ON tournament_rules_history(tournament_id);
