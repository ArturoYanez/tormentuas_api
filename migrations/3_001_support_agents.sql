-- Tabla principal de agentes de soporte
CREATE TABLE IF NOT EXISTS support_agents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    employee_id VARCHAR(20) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    bio TEXT,
    department VARCHAR(20) DEFAULT 'support' CHECK (department IN ('support', 'vip_support', 'technical')),
    position VARCHAR(100),
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('available', 'busy', 'away', 'dnd', 'offline')),
    status_message VARCHAR(200),
    languages JSONB DEFAULT '[]',
    specializations JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_agents_user_id ON support_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_support_agents_status ON support_agents(status);
CREATE INDEX IF NOT EXISTS idx_support_agents_department ON support_agents(department);
