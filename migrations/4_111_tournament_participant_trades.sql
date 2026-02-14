-- Operaciones de participantes en torneos
CREATE TABLE IF NOT EXISTS tournament_participant_trades (
    id SERIAL PRIMARY KEY,
    participant_id INTEGER,
    tournament_id INTEGER NOT NULL,
    trade_id INTEGER NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    direction VARCHAR(10) NOT NULL,
    amount DECIMAL(18,8) NOT NULL,
    result VARCHAR(20) DEFAULT 'pending',
    profit DECIMAL(18,8),
    balance_before DECIMAL(18,8),
    balance_after DECIMAL(18,8),
    rank_before INTEGER,
    rank_after INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournament_participant_trades_tournament ON tournament_participant_trades(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participant_trades_trade ON tournament_participant_trades(trade_id);
