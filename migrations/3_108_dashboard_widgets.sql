-- Widgets del dashboard del agente
CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE,
    widget_type VARCHAR(50),
    title VARCHAR(100),
    position_x INTEGER,
    position_y INTEGER,
    width INTEGER DEFAULT 1,
    height INTEGER DEFAULT 1,
    config JSONB,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_agent_id ON dashboard_widgets(agent_id);
