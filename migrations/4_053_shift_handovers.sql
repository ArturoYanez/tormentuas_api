-- Traspasos de turno
CREATE TABLE IF NOT EXISTS shift_handovers (
    id SERIAL PRIMARY KEY,
    from_operator_id INTEGER REFERENCES operators(id),
    to_operator_id INTEGER REFERENCES operators(id),
    notes TEXT,
    pending_alerts JSONB DEFAULT '[]',
    pending_tasks JSONB DEFAULT '[]',
    important_users JSONB DEFAULT '[]',
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shift_handovers_from ON shift_handovers(from_operator_id);
CREATE INDEX IF NOT EXISTS idx_shift_handovers_to ON shift_handovers(to_operator_id);
