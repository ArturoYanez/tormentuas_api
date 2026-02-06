-- Bonos asignados a usuarios
CREATE TABLE IF NOT EXISTS user_bonuses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    bonus_id INTEGER REFERENCES bonuses(id),
    amount DECIMAL(18,8) NOT NULL,
    rollover_required DECIMAL(18,8),
    rollover_completed DECIMAL(18,8) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_bonuses_user_id ON user_bonuses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bonuses_status ON user_bonuses(status);
