-- Feedback de FAQs
CREATE TABLE IF NOT EXISTS faq_feedback (
    id SERIAL PRIMARY KEY,
    faq_id INTEGER REFERENCES faqs(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    is_helpful BOOLEAN,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_faq_feedback_faq_id ON faq_feedback(faq_id);
