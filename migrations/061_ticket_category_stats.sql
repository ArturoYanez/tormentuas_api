-- Estadísticas por categoría de ticket
CREATE TABLE IF NOT EXISTS ticket_category_stats (
    id SERIAL PRIMARY KEY,
    date DATE,
    category VARCHAR(50),
    total_tickets INTEGER DEFAULT 0,
    resolved_tickets INTEGER DEFAULT 0,
    avg_resolution_minutes DECIMAL(10,2),
    sla_breaches INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticket_category_stats_date ON ticket_category_stats(date);
