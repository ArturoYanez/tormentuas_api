-- Mercados disponibles
CREATE TABLE IF NOT EXISTS markets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(30) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    position INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_markets_type ON markets(type);
CREATE INDEX IF NOT EXISTS idx_markets_is_active ON markets(is_active);

-- Insertar mercados por defecto
INSERT INTO markets (name, type, position) VALUES
('Criptomonedas', 'crypto', 1),
('Forex', 'forex', 2),
('Commodities', 'commodities', 3),
('Acciones', 'stocks', 4),
('Índices', 'indices', 5)
ON CONFLICT DO NOTHING;
