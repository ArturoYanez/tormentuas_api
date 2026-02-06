-- Pausas de torneos
CREATE TABLE IF NOT EXISTS tournament_pauses (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    paused_by INTEGER REFERENCES operators(id),
    reason TEXT,
    paused_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resumed_at TIMESTAMP,
    resumed_by INTEGER REFERENCES operators(id)
);

CREATE INDEX IF NOT EXISTS idx_tournament_pauses_tournament ON tournament_pauses(tournament_id);
