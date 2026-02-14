-- Proveedores
CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE,
    tax_id VARCHAR(50),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    country VARCHAR(100),
    category VARCHAR(100),
    payment_terms INTEGER DEFAULT 30,
    preferred_payment_method VARCHAR(50),
    bank_details JSONB,
    contact_person VARCHAR(200),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    total_invoices INTEGER DEFAULT 0,
    total_paid DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vendors_code ON vendors(code);
CREATE INDEX IF NOT EXISTS idx_vendors_active ON vendors(is_active);
