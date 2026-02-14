-- Horario de trabajo del operador
CREATE TABLE IF NOT EXISTS operator_work_schedule (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time TIME,
    end_time TIME,
    is_working_day BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_work_schedule_operator_id ON operator_work_schedule(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_work_schedule_day ON operator_work_schedule(day_of_week);
