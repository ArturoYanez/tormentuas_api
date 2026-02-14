-- Configuraciones de premios de torneos
CREATE TABLE IF NOT EXISTS tournament_prize_configurations (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    position INTEGER NOT NULL,
    prize_amount DECIMAL(18,8) NOT NULL,
    prize_type VARCHAR(20) DEFAULT 'cash',
    configured_by INTEGER REFERENCES operators(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournament_prize_configurations_tournament ON tournament_prize_configurations(tournament_id);
