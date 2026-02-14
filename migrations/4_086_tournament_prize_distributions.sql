-- Distribuciones de premios de torneos
CREATE TABLE IF NOT EXISTS tournament_prize_distributions (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    prize_amount DECIMAL(18,8) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    distributed_by INTEGER REFERENCES operators(id),
    distributed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournament_prize_distributions_tournament ON tournament_prize_distributions(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_prize_distributions_user ON tournament_prize_distributions(user_id);
