-- Videollamadas de soporte programadas
CREATE TABLE IF NOT EXISTS support_video_calls (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ticket_id INTEGER REFERENCES support_tickets(id),
    agent_id INTEGER REFERENCES users(id),
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    meeting_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_video_calls_user_id ON support_video_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_support_video_calls_status ON support_video_calls(status);
CREATE INDEX IF NOT EXISTS idx_support_video_calls_scheduled_at ON support_video_calls(scheduled_at);
