-- Premios de torneos
CREATE TABLE IF NOT EXISTS tournament_prizes (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    od_id VARCHAR(20) NOT NULL,
    od_name VARCHAR(100),
    tournament_name VARCHAR(200),
    position INTEGER NOT NULL,
    prize_amount DECIMAL(15,2) NOT NULL,
    prize_type VARCHAR(50) DEFAULT 'cash',
    status VARCHAR(20) DEFAULT 'pending',
    paid_by INTEGER REFERENCES accountants(id),
    paid_at TIMESTAMP,
    payment_method VARCHAR(50),
    tx_reference VARCHAR(255),
    notes TEXT,
    tournament_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournament_prizes_user ON tournament_prizes(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_prizes_status ON tournament_prizes(status);
CREATE INDEX IF NOT EXISTS idx_tournament_prizes_tournament ON tournament_prizes(tournament_id);
