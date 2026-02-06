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

CREATE INDEX IF NOT EXISTS idx_operating_expenses_category ON operating_expenses(expense_category);
CREATE INDEX IF NOT EXISTS idx_operating_expenses_date ON operating_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_operating_expenses_status ON operating_expenses(status);
