-- Torneos destacados
CREATE TABLE IF NOT EXISTS tournament_featured (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    featured_by INTEGER REFERENCES operators(id),
    position INTEGER DEFAULT 0,
    starts_at TIMESTAMP,
    ends_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournament_featured_tournament ON tournament_featured(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_featured_active ON tournament_featured(is_active);
