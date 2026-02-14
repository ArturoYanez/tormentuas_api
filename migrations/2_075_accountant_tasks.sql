-- Tareas del contador
CREATE TABLE IF NOT EXISTS accountant_tasks (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) ON DELETE CASCADE,
    task_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    due_date TIMESTAMP,
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER,
    assigned_by INTEGER REFERENCES users(id),
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accountant_tasks_accountant ON accountant_tasks(accountant_id);
CREATE INDEX IF NOT EXISTS idx_accountant_tasks_status ON accountant_tasks(status);
CREATE INDEX IF NOT EXISTS idx_accountant_tasks_due ON accountant_tasks(due_date);
