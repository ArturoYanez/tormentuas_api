-- Resumen estadístico de torneos
CREATE TABLE IF NOT EXISTS tournament_summary_stats (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    total_participants INTEGER DEFAULT 0,
    active_participants INTEGER DEFAULT 0,
    disqualified_participants INTEGER DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    total_volume DECIMAL(18,8) DEFAULT 0,
    avg_profit_per_user DECIMAL(18,8) DEFAULT 0,
    top_profit DECIMAL(18,8) DEFAULT 0,
    lowest_profit DECIMAL(18,8) DEFAULT 0,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournament_summary_stats_tournament ON tournament_summary_stats(tournament_id);
