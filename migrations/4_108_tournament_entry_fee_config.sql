-- Configuración de cuota de entrada
CREATE TABLE IF NOT EXISTS tournament_entry_fee_config (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    entry_fee DECIMAL(18,8) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    early_bird_discount DECIMAL(5,2),
    early_bird_until TIMESTAMP,
    vip_discount DECIMAL(5,2),
    referral_discount DECIMAL(5,2),
    configured_by INTEGER REFERENCES operators(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournament_entry_fee_tournament ON tournament_entry_fee_config(tournament_id);
