-- Lecturas de anuncios
CREATE TABLE IF NOT EXISTS announcement_reads (
    id SERIAL PRIMARY KEY,
    announcement_id INTEGER REFERENCES support_announcements(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES support_agents(id),
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_announcement_reads_announcement_id ON announcement_reads(announcement_id);
