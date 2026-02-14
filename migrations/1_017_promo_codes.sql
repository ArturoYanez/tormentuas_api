-- Códigos promocionales usados
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'promo_codes'
    ) AND NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'promo_codes' AND column_name = 'user_id'
    ) THEN
        DROP TABLE promo_codes CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS promo_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    bonus_id INTEGER REFERENCES bonuses(id),
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_user_id ON promo_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
