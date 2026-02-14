-- Dispositivos registrados del usuario
CREATE TABLE IF NOT EXISTS user_devices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(200) NOT NULL,
    device_name VARCHAR(100),
    device_type VARCHAR(20),
    os VARCHAR(50),
    browser VARCHAR(50),
    is_trusted BOOLEAN DEFAULT FALSE,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_devices_unique ON user_devices(user_id, device_id);
