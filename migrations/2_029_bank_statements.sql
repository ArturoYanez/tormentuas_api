-- Estados de cuenta bancarios
CREATE TABLE IF NOT EXISTS bank_statements (
    id SERIAL PRIMARY KEY,
    bank_account_id INTEGER,
    statement_date DATE NOT NULL,
    opening_balance DECIMAL(15,2),
    closing_balance DECIMAL(15,2),
    total_credits DECIMAL(15,2),
    total_debits DECIMAL(15,2),
    transaction_count INTEGER,
    file_path VARCHAR(500),
    imported_by INTEGER REFERENCES accountants(id),
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reconciled BOOLEAN DEFAULT false,
    reconciled_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bank_statements_date ON bank_statements(statement_date);
CREATE INDEX IF NOT EXISTS idx_bank_statements_account ON bank_statements(bank_account_id);
