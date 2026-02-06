-- Adiciones manuales de usuarios a torneos
CREATE TABLE IF NOT EXISTS tournament_manual_additions (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id),
    reason TEXT,
    waived_entry_fee BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournament_manual_additions_tournament ON tournament_manual_additions(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_manual_additions_user ON tournament_manual_additions(user_id);
