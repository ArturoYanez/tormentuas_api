-- Estadísticas de usuarios
CREATE TABLE IF NOT EXISTS user_statistics (
    id SERIAL PRIMARY KEY,
    stat_date DATE NOT NULL UNIQUE,
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    verified_users INTEGER DEFAULT 0,
    suspended_users INTEGER DEFAULT 0,
    users_with_balance INTEGER DEFAULT 0,
    total_user_balance DECIMAL(15,2) DEFAULT 0,
    average_user_balance DECIMAL(15,2) DEFAULT 0,
    top_depositors_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_statistics_date ON user_statistics(stat_date);
