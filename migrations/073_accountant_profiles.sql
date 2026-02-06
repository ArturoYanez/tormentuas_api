-- Perfiles de contadores
CREATE TABLE IF NOT EXISTS accountant_profiles (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) ON DELETE CASCADE UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    avatar_url VARCHAR(500),
    bio TEXT,
    timezone VARCHAR(100) DEFAULT 'Europe/Madrid',
    language VARCHAR(10) DEFAULT 'es',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accountant_profiles_accountant ON accountant_profiles(accountant_id);
