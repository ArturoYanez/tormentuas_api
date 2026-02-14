-- Cursos de la academia
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(30) NOT NULL,
    level VARCHAR(20) DEFAULT 'beginner',
    duration_minutes INTEGER,
    thumbnail_url VARCHAR(500),
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'category'
    ) THEN
        ALTER TABLE courses ADD COLUMN category VARCHAR(30);
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'level'
    ) THEN
        ALTER TABLE courses ADD COLUMN level VARCHAR(20) DEFAULT 'beginner';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'position'
    ) THEN
        ALTER TABLE courses ADD COLUMN position INTEGER DEFAULT 0;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON courses(is_active);
