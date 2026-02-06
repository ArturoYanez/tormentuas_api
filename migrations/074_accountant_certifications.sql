-- Certificaciones del contador
CREATE TABLE IF NOT EXISTS accountant_certifications (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) ON DELETE CASCADE,
    certification_name VARCHAR(200) NOT NULL,
    issuing_organization VARCHAR(200),
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(100),
    verification_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accountant_certifications_accountant ON accountant_certifications(accountant_id);
