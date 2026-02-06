-- Noticias del mercado
CREATE TABLE IF NOT EXISTS market_news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    summary TEXT,
    content TEXT,
    source VARCHAR(100),
    source_url VARCHAR(500),
    image_url VARCHAR(500),
    category VARCHAR(50),
    symbols TEXT[],
    sentiment VARCHAR(20),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Noticias guardadas por el usuario
CREATE TABLE IF NOT EXISTS user_saved_news (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    news_id INTEGER REFERENCES market_news(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_market_news_published_at ON market_news(published_at);
CREATE INDEX IF NOT EXISTS idx_market_news_category ON market_news(category);
CREATE INDEX IF NOT EXISTS idx_user_saved_news_user_id ON user_saved_news(user_id);
