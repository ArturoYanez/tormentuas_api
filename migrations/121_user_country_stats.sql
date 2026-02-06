-- Estadísticas por país
CREATE TABLE IF NOT EXISTS user_country_stats (
    id SERIAL PRIMARY KEY,
    country_code VARCHAR(5) NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    total_volume DECIMAL(18,8) DEFAULT 0,
    total_deposits DECIMAL(18,8) DEFAULT 0,
    total_withdrawals DECIMAL(18,8) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_country_stats_code ON user_country_stats(country_code);
