-- Atajos de teclado por defecto
CREATE TABLE IF NOT EXISTS default_shortcuts (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100),
    description VARCHAR(200),
    keys VARCHAR(50),
    is_editable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
