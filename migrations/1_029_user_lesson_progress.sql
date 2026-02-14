-- Progreso por lección
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES course_lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    watch_time_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_lesson_progress_unique ON user_lesson_progress(user_id, lesson_id);
