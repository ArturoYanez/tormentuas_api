-- Videos tutoriales independientes
CREATE TABLE IF NOT EXISTS tutorial_videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    video_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    duration VARCHAR(10),
    category VARCHAR(50),
    views_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tutorial_videos_category ON tutorial_videos(category);
CREATE INDEX IF NOT EXISTS idx_tutorial_videos_is_active ON tutorial_videos(is_active);
