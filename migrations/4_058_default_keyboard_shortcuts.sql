-- Atajos de teclado por defecto
CREATE TABLE IF NOT EXISTS default_keyboard_shortcuts (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    shortcut VARCHAR(50) NOT NULL,
    description VARCHAR(200),
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_default_keyboard_shortcuts_action ON default_keyboard_shortcuts(action);
CREATE INDEX IF NOT EXISTS idx_default_keyboard_shortcuts_category ON default_keyboard_shortcuts(category);
