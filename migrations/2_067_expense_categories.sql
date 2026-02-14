-- Categorías de gastos
CREATE TABLE IF NOT EXISTS expense_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    parent_id INTEGER REFERENCES expense_categories(id),
    description TEXT,
    budget_monthly DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expense_categories_code ON expense_categories(code);
CREATE INDEX IF NOT EXISTS idx_expense_categories_parent ON expense_categories(parent_id);
