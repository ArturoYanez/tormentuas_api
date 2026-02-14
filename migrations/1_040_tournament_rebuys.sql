-- Historial de re-buys en torneos
CREATE TABLE IF NOT EXISTS tournament_rebuys (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    participant_id INTEGER REFERENCES tournament_participants(id) ON DELETE CASCADE,
    amount DECIMAL(18,8) NOT NULL,
    balance_restored DECIMAL(18,8) NOT NULL,
    rebuy_number INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournament_rebuys_tournament_id ON tournament_rebuys(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_rebuys_user_id ON tournament_rebuys(user_id);
