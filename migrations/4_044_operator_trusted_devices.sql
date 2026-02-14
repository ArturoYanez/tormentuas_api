-- Dispositivos de confianza del operador
CREATE TABLE IF NOT EXISTS operator_trusted_devices (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    device_id VARCHAR(200) NOT NULL,
    device_name VARCHAR(100),
    browser VARCHAR(50),
    os VARCHAR(50),
    is_trusted BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_trusted_devices_operator ON operator_trusted_devices(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_trusted_devices_device ON operator_trusted_devices(device_id);
