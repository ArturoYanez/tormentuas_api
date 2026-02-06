-- Premios de torneos
CREATE TABLE IF NOT EXISTS tournament_prizes (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    prize_amount DECIMAL(18,8) NOT NULL,
    prize_type VARCHAR(20) DEFAULT 'cash'
);

CREATE INDEX IF NOT EXISTS idx_tournament_prizes_tournament_id ON tournament_prizes(tournament_id);
