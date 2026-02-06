-- Cambios en fechas de torneos
CREATE TABLE IF NOT EXISTS tournament_date_changes (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    date_type VARCHAR(50) NOT NULL,
    previous_date TIMESTAMP,
    new_date TIMESTAMP NOT NULL,
    reason TEXT,
    changed_by INTEGER REFERENCES operators(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notified_participants BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_tournament_date_changes_tournament ON tournament_date_changes(tournament_id);
