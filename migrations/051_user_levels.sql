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

-- Insertar niveles por defecto
INSERT INTO user_levels (name, min_volume, cashback_percentage, withdrawal_priority, personal_manager, exclusive_bonuses, color) VALUES
('Bronce', 0, 0, FALSE, FALSE, FALSE, '#CD7F32'),
('Plata', 10000, 1, FALSE, FALSE, FALSE, '#C0C0C0'),
('Oro', 50000, 2, TRUE, FALSE, TRUE, '#FFD700'),
('Platino', 100000, 3, TRUE, TRUE, TRUE, '#E5E4E2'),
('Diamante', 500000, 5, TRUE, TRUE, TRUE, '#B9F2FF')
ON CONFLICT DO NOTHING;
