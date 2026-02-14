-- Estadísticas diarias del agente
CREATE TABLE IF NOT EXISTS agent_daily_stats (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    date DATE,
    tickets_assigned INTEGER DEFAULT 0,
    tickets_resolved INTEGER DEFAULT 0,
    tickets_escalated INTEGER DEFAULT 0,
    chats_handled INTEGER DEFAULT 0,
    avg_response_time_minutes DECIMAL(10,2),
    avg_resolution_time_minutes DECIMAL(10,2),
    sla_compliance_rate DECIMAL(5,2),
    avg_rating DECIMAL(3,2),
    ratings_count INTEGER DEFAULT 0,
    online_time_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'agent_daily_stats' AND column_name = 'date'
    ) THEN
        ALTER TABLE agent_daily_stats ADD COLUMN date DATE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_agent_daily_stats_agent_date ON agent_daily_stats(agent_id, date);
