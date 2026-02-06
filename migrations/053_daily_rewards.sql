-- Recompensas diarias
CREATE TABLE IF NOT EXISTS daily_rewards (
    id SERIAL PRIMARY KEY,
    day_number INTEGER NOT NULL,
    reward_type VARCHAR(30) NOT NULL,
    reward_amount DECIMAL(18,8) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS user_daily_rewards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reward_id INTEGER REFERENCES daily_rewards(id),
    current_streak INTEGER DEFAULT 0,
    last_claim_date DATE,
    total_claimed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_daily_rewards_user_id ON user_daily_rewards(user_id);

-- Insertar recompensas diarias por defecto
INSERT INTO daily_rewards (day_number, reward_type, reward_amount) VALUES
(1, 'bonus', 1),
(2, 'bonus', 2),
(3, 'bonus', 3),
(4, 'bonus', 5),
(5, 'bonus', 7),
(6, 'bonus', 10),
(7, 'bonus', 15)
ON CONFLICT DO NOTHING;
