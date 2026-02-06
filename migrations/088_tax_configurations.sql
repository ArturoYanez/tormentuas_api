-- Configuraciones de impuestos
CREATE TABLE IF NOT EXISTS tax_configurations (
    id SERIAL PRIMARY KEY,
    tax_name VARCHAR(100) NOT NULL,
    tax_code VARCHAR(50) UNIQUE NOT NULL,
    tax_rate DECIMAL(5,4) NOT NULL,
    applies_to VARCHAR(100),
    country VARCHAR(100),
    is_withholding BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tax_configurations_code ON tax_configurations(tax_code);
CREATE INDEX IF NOT EXISTS idx_tax_configurations_active ON tax_configurations(is_active);
