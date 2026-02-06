-- Usuarios de prueba para desarrollo
-- Contraseña para todos: password123

-- Usuario normal de prueba
INSERT INTO users (email, password, first_name, last_name, role, balance, demo_balance, is_verified, verification_status)
VALUES ('user@tormentus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQlPJmx2UtKVqcPe4Y/vMwvhaWrS', 'Usuario', 'Demo', 'user', 1000, 10000, true, 'approved')
ON CONFLICT (email) DO NOTHING;

-- Actualizar usuarios existentes para asegurar que tengan balance
UPDATE users SET balance = 5000, demo_balance = 50000 WHERE email = 'admin@tormentus.com';
UPDATE users SET balance = 2000, demo_balance = 20000 WHERE email = 'operator@tormentus.com';
UPDATE users SET balance = 2000, demo_balance = 20000 WHERE email = 'accountant@tormentus.com';
UPDATE users SET balance = 1000, demo_balance = 15000 WHERE email = 'support@tormentus.com';
