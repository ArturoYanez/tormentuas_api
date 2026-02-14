-- Certificados obtenidos
CREATE TABLE IF NOT EXISTS user_certificates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    certificate_url VARCHAR(500),
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_certificates_user_id ON user_certificates(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_certificates_unique ON user_certificates(user_id, course_id);
