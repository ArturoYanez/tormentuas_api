-- Seguimiento de login de usuarios
CREATE TABLE IF NOT EXISTS user_login_tracking (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    login_at TIMESTAMP NOT NULL,
    logout_at TIMESTAMP,
    session_duration INTEGER,
    ip_address VARCHAR(45),
    device VARCHAR(200),
    location VARCHAR(100),
    pages_visited INTEGER DEFAULT 0,
    trades_made INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_user_login_tracking_user ON user_login_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_user_login_tracking_date ON user_login_tracking(login_at);
