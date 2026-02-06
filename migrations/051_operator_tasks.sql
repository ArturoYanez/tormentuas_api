-- Tareas asignadas a operadores
CREATE TABLE IF NOT EXISTS operator_tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    assigned_to INTEGER REFERENCES operators(id),
    assigned_by INTEGER REFERENCES operators(id),
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    due_date TIMESTAMP,
    related_type VARCHAR(50),
    related_id INTEGER,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_tasks_assigned ON operator_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_operator_tasks_status ON operator_tasks(status);
CREATE INDEX IF NOT EXISTS idx_operator_tasks_due ON operator_tasks(due_date);
