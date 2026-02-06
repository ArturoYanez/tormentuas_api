-- Historial de resets de cuenta demo
CREATE TABLE IF NOT EXISTS demo_resets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    previous_balance DECIMAL(18,8) NOT NULL,
    new_balance DECIMAL(18,8) NOT NULL,
    reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_demo_resets_user_id ON demo_resets(user_id);
