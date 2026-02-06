-- Snapshots del leaderboard para historial
CREATE TABLE IF NOT EXISTS tournament_leaderboard_snapshots (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    balance DECIMAL(18,8) NOT NULL,
    profit DECIMAL(18,8) DEFAULT 0,
    profit_percent DECIMAL(10,4) DEFAULT 0,
    trades_count INTEGER DEFAULT 0,
    snapshot_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournament_leaderboard_snapshots_tournament_id ON tournament_leaderboard_snapshots(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_leaderboard_snapshots_snapshot_at ON tournament_leaderboard_snapshots(snapshot_at);
