-- Acciones de macros
CREATE TABLE IF NOT EXISTS macro_actions (
    id SERIAL PRIMARY KEY,
    macro_id INTEGER REFERENCES support_macros(id) ON DELETE CASCADE,
    action_type VARCHAR(20) CHECK (action_type IN ('reply', 'status', 'tag', 'assign', 'priority', 'escalate')),
    action_value TEXT,
    action_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_macro_actions_macro_id ON macro_actions(macro_id);
