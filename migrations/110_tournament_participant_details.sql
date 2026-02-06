-- Detalles extendidos de participantes
CREATE TABLE IF NOT EXISTS tournament_participant_details (
    id SERIAL PRIMARY KEY,
    participant_id INTEGER,
    tournament_id INTEGER NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    current_balance DECIMAL(18,8) DEFAULT 0,
    initial_balance DECIMAL(18,8) DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    total_profit DECIMAL(18,8) DEFAULT 0,
    total_loss DECIMAL(18,8) DEFAULT 0,
    net_profit DECIMAL(18,8) DEFAULT 0,
    profit_percentage DECIMAL(10,4) DEFAULT 0,
    current_rank INTEGER,
    best_rank INTEGER,
    worst_rank INTEGER,
    last_trade_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournament_participant_details_tournament ON tournament_participant_details(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participant_details_user ON tournament_participant_details(user_id);
