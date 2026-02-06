-- Términos y condiciones
CREATE TABLE IF NOT EXISTS terms_conditions (
    id SERIAL PRIMARY KEY,
    version VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'terms',
    is_active BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_terms_acceptance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    terms_id INTEGER REFERENCES terms_conditions(id),
    ip_address VARCHAR(45),
    accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_terms_conditions_is_active ON terms_conditions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_terms_acceptance_user_id ON user_terms_acceptance(user_id);
