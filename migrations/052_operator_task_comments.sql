-- Comentarios en tareas
CREATE TABLE IF NOT EXISTS operator_task_comments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES operator_tasks(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_task_comments_task ON operator_task_comments(task_id);
