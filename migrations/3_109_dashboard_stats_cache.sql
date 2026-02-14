-- Caché de estadísticas del dashboard
CREATE TABLE IF NOT EXISTS dashboard_stats_cache (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    stat_type VARCHAR(50),
    stat_value JSONB,
    period VARCHAR(20),
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dashboard_stats_cache_agent ON dashboard_stats_cache(agent_id, stat_type);
