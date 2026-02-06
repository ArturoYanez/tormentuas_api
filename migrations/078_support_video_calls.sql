-- Videollamadas de soporte
CREATE TABLE IF NOT EXISTS support_video_calls (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id),
    user_id INTEGER REFERENCES users(id),
    agent_id INTEGER REFERENCES support_agents(id),
    scheduled_at TIMESTAMP,
    duration_minutes INTEGER DEFAULT 30,
    meeting_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    recording_url VARCHAR(500),
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_support_video_calls_ticket_id ON support_video_calls(ticket_id);
CREATE INDEX idx_support_video_calls_agent_id ON support_video_calls(agent_id);
