-- Niveles del programa de referidos
CREATE TABLE IF NOT EXISTS referral_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    min_referrals INTEGER NOT NULL,
    deposit_commission DECIMAL(5,2) NOT NULL,
    trade_commission DECIMAL(5,2) NOT NULL,
    signup_bonus DECIMAL(18,8) DEFAULT 0
);

-- Insertar niveles por defecto
INSERT INTO referral_tiers (name, min_referrals, deposit_commission, trade_commission, signup_bonus) VALUES
('Bronce', 0, 5.00, 0.50, 5),
('Plata', 10, 7.50, 0.75, 10),
('Oro', 25, 10.00, 1.00, 15),
('Platino', 50, 12.50, 1.25, 20),
('Diamante', 100, 15.00, 1.50, 25)
ON CONFLICT DO NOTHING;
