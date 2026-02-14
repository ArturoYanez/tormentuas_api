-- Desafíos de práctica
CREATE TABLE IF NOT EXISTS practice_challenges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    target_profit DECIMAL(18,8) NOT NULL,
    max_trades INTEGER,
    time_limit_hours INTEGER,
    reward_type VARCHAR(30),
    reward_value DECIMAL(18,8),
    is_active BOOLEAN DEFAULT TRUE
);

-- Progreso en desafíos de práctica
CREATE TABLE IF NOT EXISTS user_practice_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES practice_challenges(id),
    current_profit DECIMAL(18,8) DEFAULT 0,
    trades_made INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'in_progress',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_practice_challenges_is_active ON practice_challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_user_practice_progress_user_id ON user_practice_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_practice_progress_status ON user_practice_progress(status);
