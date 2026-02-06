-- Acciones rápidas del dashboard
CREATE TABLE IF NOT EXISTS operator_quick_actions (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    action_label VARCHAR(100) NOT NULL,
    action_icon VARCHAR(50),
    action_url VARCHAR(200),
    position INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_quick_actions_operator ON operator_quick_actions(operator_id);
