-- Distribución horaria de tickets
CREATE TABLE IF NOT EXISTS hourly_ticket_distribution (
    id SERIAL PRIMARY KEY,
    date DATE,
    hour INTEGER CHECK (hour >= 0 AND hour <= 23),
    tickets_created INTEGER DEFAULT 0,
    tickets_resolved INTEGER DEFAULT 0,
    chats_started INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hourly_ticket_distribution_date ON hourly_ticket_distribution(date);
