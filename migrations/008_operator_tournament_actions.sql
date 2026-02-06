-- Acciones del operador sobre torneos
CREATE TABLE IF NOT EXISTS operator_tournament_actions (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    tournament_id INTEGER,
    action VARCHAR(50) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_tournament_actions_operator_id ON operator_tournament_actions(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_tournament_actions_tournament_id ON operator_tournament_actions(tournament_id);
