-- Configuración de balance inicial de torneos
CREATE TABLE IF NOT EXISTS tournament_initial_balance_config (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    initial_balance DECIMAL(18,8) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    allow_rebuy BOOLEAN DEFAULT FALSE,
    rebuy_cost DECIMAL(18,8),
    max_rebuys INTEGER DEFAULT 0,
    configured_by INTEGER REFERENCES operators(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournament_initial_balance_tournament ON tournament_initial_balance_config(tournament_id);
