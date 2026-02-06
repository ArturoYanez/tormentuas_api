-- Dispositivos de confianza del contador
CREATE TABLE IF NOT EXISTS accountant_trusted_devices (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) ON DELETE CASCADE,
    device_name VARCHAR(200) NOT NULL,
    device_type VARCHAR(50),
    device_fingerprint VARCHAR(255) UNIQUE,
    last_used TIMESTAMP,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_accountant_trusted_devices_accountant ON accountant_trusted_devices(accountant_id);
CREATE INDEX IF NOT EXISTS idx_accountant_trusted_devices_fingerprint ON accountant_trusted_devices(device_fingerprint);
