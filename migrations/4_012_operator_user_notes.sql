-- Notas del operador sobre usuarios
CREATE TABLE IF NOT EXISTS operator_user_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id),
    note TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_user_notes_user ON operator_user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_operator_user_notes_operator ON operator_user_notes(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_user_notes_priority ON operator_user_notes(priority);
