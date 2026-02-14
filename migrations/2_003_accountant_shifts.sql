-- Turnos de contadores
CREATE TABLE IF NOT EXISTS accountant_shifts (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    transactions_processed INTEGER DEFAULT 0,
    total_approved DECIMAL(15,2) DEFAULT 0,
    total_rejected DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accountant_shifts_accountant ON accountant_shifts(accountant_id);
CREATE INDEX IF NOT EXISTS idx_accountant_shifts_date ON accountant_shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_accountant_shifts_status ON accountant_shifts(status);
