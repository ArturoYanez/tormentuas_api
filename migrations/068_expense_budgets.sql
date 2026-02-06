-- Presupuestos de gastos
CREATE TABLE IF NOT EXISTS expense_budgets (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES expense_categories(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    budgeted_amount DECIMAL(15,2) NOT NULL,
    actual_amount DECIMAL(15,2) DEFAULT 0,
    variance DECIMAL(15,2) DEFAULT 0,
    variance_percentage DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_expense_budgets_category ON expense_budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_expense_budgets_period ON expense_budgets(year, month);
