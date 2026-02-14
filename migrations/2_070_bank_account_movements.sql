-- Movimientos de cuentas bancarias
CREATE TABLE IF NOT EXISTS bank_account_movements (
    id SERIAL PRIMARY KEY,
    bank_account_id INTEGER REFERENCES bank_accounts(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2),
    balance_after DECIMAL(15,2),
    reference VARCHAR(255),
    description TEXT,
    counterparty VARCHAR(200),
    movement_date DATE NOT NULL,
    value_date DATE,
    reconciled BOOLEAN DEFAULT false,
    reconciled_with_id INTEGER,
    reconciled_with_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bank_account_movements_account ON bank_account_movements(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_account_movements_date ON bank_account_movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_bank_account_movements_reconciled ON bank_account_movements(reconciled);
