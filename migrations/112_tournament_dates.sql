-- Fechas importantes de torneos
CREATE TABLE IF NOT EXISTS tournament_dates (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    registration_start TIMESTAMP,
    registration_end TIMESTAMP,
    trading_start TIMESTAMP,
    trading_end TIMESTAMP,
    results_announcement TIMESTAMP,
    prize_distribution TIMESTAMP,
    configured_by INTEGER REFERENCES operators(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournament_dates_tournament ON tournament_dates(tournament_id);
