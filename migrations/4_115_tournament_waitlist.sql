-- Lista de espera de torneos
CREATE TABLE IF NOT EXISTS tournament_waitlist (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting',
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admitted_at TIMESTAMP,
    notified BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_tournament_waitlist_tournament ON tournament_waitlist(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_waitlist_user ON tournament_waitlist(user_id);
