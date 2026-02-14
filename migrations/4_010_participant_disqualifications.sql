-- Descalificaciones de participantes
CREATE TABLE IF NOT EXISTS participant_disqualifications (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    participant_id INTEGER,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id),
    reason TEXT NOT NULL,
    evidence JSONB DEFAULT '[]',
    is_permanent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_participant_disqualifications_tournament ON participant_disqualifications(tournament_id);
CREATE INDEX IF NOT EXISTS idx_participant_disqualifications_user ON participant_disqualifications(user_id);
