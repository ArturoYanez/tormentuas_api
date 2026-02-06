-- Puntuaciones NPS
CREATE TABLE IF NOT EXISTS nps_scores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    score INTEGER CHECK (score >= 0 AND score <= 10),
    feedback TEXT,
    source VARCHAR(15) CHECK (source IN ('ticket', 'chat', 'email', 'app')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nps_scores_user_id ON nps_scores(user_id);
