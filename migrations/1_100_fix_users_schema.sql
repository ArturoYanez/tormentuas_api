-- Migración para arreglar la discrepancia entre el código Go y el esquema inicial de DB
-- Alinea la tabla 'users' con internal/models/user.go y internal/repositories/postgres_user_repository.go

-- Renombrar password_hash a password si existe y borrar password si ya existía por error
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
        ALTER TABLE users RENAME COLUMN password_hash TO password;
    END IF;
END $$;

-- Asegurar que las columnas necesarias existan con los nombres correctos
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS balance DECIMAL(18, 8) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS demo_balance DECIMAL(18, 8) DEFAULT 10000,
    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'none',
    ADD COLUMN IF NOT EXISTS total_deposits DECIMAL(18, 8) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_withdrawals DECIMAL(18, 8) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_trades INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS win_rate DECIMAL(5, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_win_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS consecutive_wins INTEGER DEFAULT 0;

-- Migrar datos de 'name' a 'first_name' si es posible (opcional, para no perder datos si ya había usuarios)
UPDATE users SET first_name = name WHERE first_name IS NULL AND name IS NOT NULL;
