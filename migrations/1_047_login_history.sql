-- Historial de inicios de sesión
CREATE TABLE IF NOT EXISTS login_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    device VARCHAR(200),
    location VARCHAR(100),
    status VARCHAR(20) NOT NULL,
    failure_reason VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'login_history' AND column_name = 'login_at'
    ) THEN
        ALTER TABLE login_history RENAME COLUMN login_at TO created_at;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'login_history' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE login_history ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_status ON login_history(status);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON login_history(created_at);
