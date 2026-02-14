-- Transacciones bancarias
CREATE TABLE IF NOT EXISTS bank_transactions (
    id SERIAL PRIMARY KEY,
    bank_statement_id INTEGER REFERENCES bank_statements(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    value_date DATE,
    description TEXT,
    reference VARCHAR(255),
    debit_amount DECIMAL(15,2),
    credit_amount DECIMAL(15,2),
    balance DECIMAL(15,2),
    category VARCHAR(100),
    matched BOOLEAN DEFAULT false,
    matched_to_id INTEGER,
    matched_to_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bank_transactions_statement ON bank_transactions(bank_statement_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_matched ON bank_transactions(matched);
