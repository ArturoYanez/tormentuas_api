-- Preguntas de seguridad del contador
CREATE TABLE IF NOT EXISTS accountant_security_questions (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer_hash VARCHAR(255) NOT NULL,
    question_order INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accountant_security_questions_accountant ON accountant_security_questions(accountant_id);
