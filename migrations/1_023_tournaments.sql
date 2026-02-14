-- Torneos disponibles
CREATE TABLE IF NOT EXISTS tournaments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'free',
    entry_fee DECIMAL(18,8) DEFAULT 0,
    prize_pool DECIMAL(18,8) DEFAULT 0,
    initial_balance DECIMAL(18,8) DEFAULT 1000,
    max_participants INTEGER DEFAULT 100,
    min_participants INTEGER DEFAULT 2,
    status VARCHAR(20) DEFAULT 'upcoming',
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_starts_at ON tournaments(starts_at);
