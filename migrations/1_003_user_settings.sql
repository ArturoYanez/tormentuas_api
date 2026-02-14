-- Configuraciones del usuario
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    theme VARCHAR(20) DEFAULT 'dark',
    language VARCHAR(5) DEFAULT 'es',
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(5) DEFAULT 'USD',
    compact_mode BOOLEAN DEFAULT FALSE,
    default_amount DECIMAL(10,2) DEFAULT 10,
    default_duration INTEGER DEFAULT 60,
    confirm_trades BOOLEAN DEFAULT TRUE,
    sound_effects BOOLEAN DEFAULT TRUE,
    show_balance BOOLEAN DEFAULT TRUE,
    show_activity BOOLEAN DEFAULT TRUE,
    show_tutorials BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
