-- Reglas de asignación automática
CREATE TABLE IF NOT EXISTS auto_assignment_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    conditions JSONB,
    assignment_type VARCHAR(20) CHECK (assignment_type IN ('round_robin', 'least_busy', 'skill_based')),
    target_agents JSONB,
    priority INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
