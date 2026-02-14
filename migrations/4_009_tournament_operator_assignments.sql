-- Asignación de torneos a operadores
CREATE TABLE IF NOT EXISTS tournament_operator_assignments (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'monitor',
    assigned_by INTEGER REFERENCES operators(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournament_operator_assignments_tournament ON tournament_operator_assignments(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_operator_assignments_operator ON tournament_operator_assignments(operator_id);
