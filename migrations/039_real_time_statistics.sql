-- Estadísticas en tiempo real
CREATE TABLE IF NOT EXISTS real_time_statistics (
    id SERIAL PRIMARY KEY,
    stat_type VARCHAR(50) NOT NULL,
    stat_key VARCHAR(100) NOT NULL,
    stat_value DECIMAL(18,8),
    period VARCHAR(20) DEFAULT 'hour',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_real_time_statistics_type ON real_time_statistics(stat_type);
CREATE INDEX IF NOT EXISTS idx_real_time_statistics_key ON real_time_statistics(stat_key);
CREATE INDEX IF NOT EXISTS idx_real_time_statistics_date ON real_time_statistics(recorded_at);
