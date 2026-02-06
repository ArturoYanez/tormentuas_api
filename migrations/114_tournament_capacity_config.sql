-- Configuración de capacidad de torneos
CREATE TABLE IF NOT EXISTS tournament_capacity_config (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    max_participants INTEGER,
    min_participants INTEGER,
    waitlist_enabled BOOLEAN DEFAULT FALSE,
    waitlist_max INTEGER,
    auto_start_on_min BOOLEAN DEFAULT FALSE,
    configured_by INTEGER REFERENCES operators(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournament_capacity_tournament ON tournament_capacity_config(tournament_id);
