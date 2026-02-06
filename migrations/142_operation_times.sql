-- Tiempos de operación disponibles
CREATE TABLE IF NOT EXISTS operation_times (
    id SERIAL PRIMARY KEY,
    duration_seconds INTEGER NOT NULL UNIQUE,
    display_name VARCHAR(50) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    min_investment DECIMAL(18,8),
    max_investment DECIMAL(18,8),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operation_times_enabled ON operation_times(is_enabled);
CREATE INDEX IF NOT EXISTS idx_operation_times_order ON operation_times(sort_order);
