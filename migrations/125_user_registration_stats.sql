-- Estadísticas de registro de usuarios
CREATE TABLE IF NOT EXISTS user_registration_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    new_registrations INTEGER DEFAULT 0,
    verified_users INTEGER DEFAULT 0,
    first_deposits INTEGER DEFAULT 0,
    by_country JSONB DEFAULT '{}',
    by_referral INTEGER DEFAULT 0,
    by_organic INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_registration_stats_date ON user_registration_stats(date);
