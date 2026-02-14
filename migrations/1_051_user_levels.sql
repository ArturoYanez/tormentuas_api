-- Niveles de usuario y beneficios
CREATE TABLE IF NOT EXISTS user_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    min_volume DECIMAL(18,8) DEFAULT 0,
    cashback_percentage DECIMAL(5,2) DEFAULT 0,
    withdrawal_priority BOOLEAN DEFAULT FALSE,
    personal_manager BOOLEAN DEFAULT FALSE,
    exclusive_bonuses BOOLEAN DEFAULT FALSE,
    badge_url VARCHAR(500),
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_levels' AND column_name = 'min_volume'
    ) THEN
        ALTER TABLE user_levels ADD COLUMN min_volume DECIMAL(18,8) DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_levels' AND column_name = 'cashback_percentage'
    ) THEN
        ALTER TABLE user_levels ADD COLUMN cashback_percentage DECIMAL(5,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_levels' AND column_name = 'withdrawal_priority'
    ) THEN
        ALTER TABLE user_levels ADD COLUMN withdrawal_priority BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_levels' AND column_name = 'personal_manager'
    ) THEN
        ALTER TABLE user_levels ADD COLUMN personal_manager BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_levels' AND column_name = 'exclusive_bonuses'
    ) THEN
        ALTER TABLE user_levels ADD COLUMN exclusive_bonuses BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_levels' AND column_name = 'color'
    ) THEN
        ALTER TABLE user_levels ADD COLUMN color VARCHAR(20);
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_levels' AND column_name = 'level_number'
    ) THEN
        ALTER TABLE user_levels ALTER COLUMN level_number DROP NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_levels' AND column_name = 'min_xp'
    ) THEN
        ALTER TABLE user_levels ALTER COLUMN min_xp DROP NOT NULL;
    END IF;
END $$;

-- Insertar niveles por defecto
INSERT INTO user_levels (name, min_volume, cashback_percentage, withdrawal_priority, personal_manager, exclusive_bonuses, color) VALUES
('Bronce', 0, 0, FALSE, FALSE, FALSE, '#CD7F32'),
('Plata', 10000, 1, FALSE, FALSE, FALSE, '#C0C0C0'),
('Oro', 50000, 2, TRUE, FALSE, TRUE, '#FFD700'),
('Platino', 100000, 3, TRUE, TRUE, TRUE, '#E5E4E2'),
('Diamante', 500000, 5, TRUE, TRUE, TRUE, '#B9F2FF')
ON CONFLICT DO NOTHING;
