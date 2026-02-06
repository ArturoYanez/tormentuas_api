-- Tipos de comisión
CREATE TABLE IF NOT EXISTS commission_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    percentage DECIMAL(5,4),
    fixed_amount DECIMAL(15,2),
    min_amount DECIMAL(15,2),
    max_amount DECIMAL(15,2),
    applies_to VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_commission_types_code ON commission_types(code);
CREATE INDEX IF NOT EXISTS idx_commission_types_active ON commission_types(is_active);
