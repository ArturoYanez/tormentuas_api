-- Participantes de torneos
CREATE TABLE IF NOT EXISTS tournament_participants (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(18,8) DEFAULT 0,
    profit DECIMAL(18,8) DEFAULT 0,
    rank INTEGER DEFAULT 0,
    trades_count INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_id ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user_id ON tournament_participants(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tournament_participants_unique ON tournament_participants(tournament_id, user_id);
