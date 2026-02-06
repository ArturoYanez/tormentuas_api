-- Políticas de SLA
CREATE TABLE IF NOT EXISTS sla_policies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(50),
    priority VARCHAR(20),
    first_response_hours INTEGER,
    resolution_hours INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sla_policies_category ON sla_policies(category);
CREATE INDEX idx_sla_policies_priority ON sla_policies(priority);
