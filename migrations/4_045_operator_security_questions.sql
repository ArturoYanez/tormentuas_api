-- Preguntas de seguridad del operador
CREATE TABLE IF NOT EXISTS operator_security_questions (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    question VARCHAR(200) NOT NULL,
    answer_hash VARCHAR(255) NOT NULL,
    position INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_security_questions_operator ON operator_security_questions(operator_id);
