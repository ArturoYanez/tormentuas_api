-- Estado online de usuarios
CREATE TABLE IF NOT EXISTS user_online_status (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    is_online BOOLEAN DEFAULT FALSE,
    last_activity TIMESTAMP,
    current_page VARCHAR(100),
    device_type VARCHAR(20),
    ip_address VARCHAR(45)
);

CREATE INDEX IF NOT EXISTS idx_user_online_status_user ON user_online_status(user_id);
CREATE INDEX IF NOT EXISTS idx_user_online_status_online ON user_online_status(is_online);
