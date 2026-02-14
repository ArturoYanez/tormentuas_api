-- Bonos disponibles en la plataforma
CREATE TABLE IF NOT EXISTS bonuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(30) NOT NULL,
    amount DECIMAL(18,8),
    percentage DECIMAL(5,2),
    min_deposit DECIMAL(18,8),
    max_bonus DECIMAL(18,8),
    rollover_multiplier INTEGER DEFAULT 1,
    code VARCHAR(20) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bonuses_code ON bonuses(code);
CREATE INDEX IF NOT EXISTS idx_bonuses_type ON bonuses(type);
CREATE INDEX IF NOT EXISTS idx_bonuses_is_active ON bonuses(is_active);
