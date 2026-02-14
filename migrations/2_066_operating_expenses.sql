-- Gastos operativos
CREATE TABLE IF NOT EXISTS operating_expenses (
    id SERIAL PRIMARY KEY,
    expense_category VARCHAR(100) NOT NULL,
    expense_type VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    expense_date DATE NOT NULL,
    vendor_id INTEGER REFERENCES vendors(id),
    invoice_id INTEGER REFERENCES invoices(id),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    is_recurring BOOLEAN DEFAULT false,
    recurrence_period VARCHAR(20),
    approved_by INTEGER REFERENCES accountants(id),
    approved_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    attachments JSONB DEFAULT '[]',
    created_by INTEGER REFERENCES accountants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'operating_expenses' AND column_name = 'expense_category'
    ) THEN
        ALTER TABLE operating_expenses ADD COLUMN expense_category VARCHAR(100) NOT NULL DEFAULT 'General';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_operating_expenses_category ON operating_expenses(expense_category);
CREATE INDEX IF NOT EXISTS idx_operating_expenses_date ON operating_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_operating_expenses_status ON operating_expenses(status);
