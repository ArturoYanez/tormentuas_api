-- Crear tabla de trades
CREATE TABLE IF NOT EXISTS trades (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    symbol VARCHAR(20) NOT NULL,
    direction VARCHAR(10) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    entry_price DECIMAL(20,8) NOT NULL,
    exit_price DECIMAL(20,8),
    duration INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    payout DECIMAL(5,2) DEFAULT 85,
    profit DECIMAL(15,2) DEFAULT 0,
    is_manipulated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    closed_at TIMESTAMP
);

-- Crear tabla de torneos
CREATE TABLE IF NOT EXISTS tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    entry_fee DECIMAL(15,2) DEFAULT 0,
    starting_balance DECIMAL(15,2) DEFAULT 200,
    prize_pool DECIMAL(15,2) DEFAULT 0,
    max_participants INTEGER DEFAULT 100,
    status VARCHAR(20) DEFAULT 'upcoming',
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de participantes de torneos
CREATE TABLE IF NOT EXISTS tournament_participants (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id),
    user_id INTEGER REFERENCES users(id),
    balance DECIMAL(15,2) DEFAULT 200,
    profit DECIMAL(15,2) DEFAULT 0,
    trades_count INTEGER DEFAULT 0,
    wins_count INTEGER DEFAULT 0,
    rank INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, user_id)
);

-- Crear tabla de verificaciones
CREATE TABLE IF NOT EXISTS user_verifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    document_type VARCHAR(50),
    document_front TEXT,
    document_back TEXT,
    selfie_with_doc TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    rejection_reason TEXT,
    reviewed_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);

-- Insertar usuario admin por defecto (password: password123)
INSERT INTO users (email, password, first_name, last_name, role, is_verified, verification_status)
VALUES ('admin@tormentus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQlPJmx2UtKVqcPe4Y/vMwvhaWrS', 'Admin', 'System', 'admin', true, 'approved')
ON CONFLICT (email) DO NOTHING;

-- Insertar usuario operador por defecto
INSERT INTO users (email, password, first_name, last_name, role, is_verified, verification_status)
VALUES ('operator@tormentus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQlPJmx2UtKVqcPe4Y/vMwvhaWrS', 'Operator', 'System', 'operator', true, 'approved')
ON CONFLICT (email) DO NOTHING;

-- Insertar usuario contador por defecto
INSERT INTO users (email, password, first_name, last_name, role, is_verified, verification_status)
VALUES ('accountant@tormentus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQlPJmx2UtKVqcPe4Y/vMwvhaWrS', 'Accountant', 'System', 'accountant', true, 'approved')
ON CONFLICT (email) DO NOTHING;

-- Insertar usuario soporte por defecto
INSERT INTO users (email, password, first_name, last_name, role, is_verified, verification_status)
VALUES ('support@tormentus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQlPJmx2UtKVqcPe4Y/vMwvhaWrS', 'Support', 'System', 'support', true, 'approved')
ON CONFLICT (email) DO NOTHING;

-- Insertar torneos de ejemplo
INSERT INTO tournaments (name, description, entry_fee, starting_balance, prize_pool, max_participants, status, starts_at, ends_at)
VALUES 
    ('Torneo Principiantes', 'Torneo gratuito para nuevos traders', 0, 200, 500, 100, 'active', NOW(), NOW() + INTERVAL '24 hours'),
    ('Torneo Bronce', 'Torneo para traders intermedios', 10, 200, 0, 50, 'upcoming', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '26 hours'),
    ('Torneo Plata', 'Torneo para traders avanzados', 50, 200, 0, 30, 'upcoming', NOW() + INTERVAL '4 hours', NOW() + INTERVAL '28 hours'),
    ('Torneo Oro', 'Torneo premium para profesionales', 100, 200, 0, 20, 'upcoming', NOW() + INTERVAL '6 hours', NOW() + INTERVAL '30 hours'),
    ('Torneo Diamante', 'El torneo mas exclusivo', 500, 200, 0, 10, 'upcoming', NOW() + INTERVAL '12 hours', NOW() + INTERVAL '36 hours')
ON CONFLICT DO NOTHING;
