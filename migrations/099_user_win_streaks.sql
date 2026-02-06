-- Rachas de victorias de usuarios
CREATE TABLE IF NOT EXISTS user_win_streaks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    streak_count INTEGER NOT NULL,
    streak_start TIMESTAMP NOT NULL,
    streak_end TIMESTAMP,
    total_profit DECIMAL(18,8) DEFAULT 0,
    symbols_traded JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    flagged BOOLEAN DEFAULT FALSE,
    reviewed_by INTEGER REFERENCES operators(id)
);

CREATE INDEX IF NOT EXISTS idx_user_win_streaks_user ON user_win_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_win_streaks_active ON user_win_streaks(is_active);
