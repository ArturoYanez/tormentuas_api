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

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_statistics' AND column_name = 'stat_date'
    ) THEN
        ALTER TABLE user_statistics ADD COLUMN stat_date DATE NOT NULL DEFAULT CURRENT_DATE;
        -- Add UNIQUE constraint if missing?
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'user_statistics' AND constraint_type = 'UNIQUE' AND constraint_name = 'user_statistics_stat_date_key'
        ) THEN
            ALTER TABLE user_statistics ADD CONSTRAINT user_statistics_stat_date_key UNIQUE (stat_date);
        END IF;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_statistics_date ON user_statistics(stat_date);
