-- PIN de seguridad del usuario
CREATE TABLE IF NOT EXISTS user_pins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    pin_hash VARCHAR(255) NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE,
    require_for_trades BOOLEAN DEFAULT FALSE,
    require_for_withdrawals BOOLEAN DEFAULT TRUE,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_pins_user_id ON user_pins(user_id);
