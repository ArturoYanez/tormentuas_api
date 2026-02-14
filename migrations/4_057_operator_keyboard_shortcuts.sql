-- Atajos de teclado personalizados
CREATE TABLE IF NOT EXISTS operator_keyboard_shortcuts (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    shortcut VARCHAR(50) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_keyboard_shortcuts_operator ON operator_keyboard_shortcuts(operator_id);
