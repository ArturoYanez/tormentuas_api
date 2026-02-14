-- Revisiones de auditoría
CREATE TABLE IF NOT EXISTS audit_reviews (
    id SERIAL PRIMARY KEY,
    review_type VARCHAR(50) NOT NULL,
    review_period_start DATE,
    review_period_end DATE,
    reviewer_id INTEGER REFERENCES accountants(id),
    findings TEXT,
    recommendations TEXT,
    risk_assessment VARCHAR(50),
    status VARCHAR(20) DEFAULT 'in_progress',
    completed_at TIMESTAMP,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_reviews_type ON audit_reviews(review_type);
CREATE INDEX IF NOT EXISTS idx_audit_reviews_status ON audit_reviews(status);
