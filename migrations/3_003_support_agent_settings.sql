-- Configuraciones del agente de soporte
CREATE TABLE IF NOT EXISTS support_agent_settings (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES support_agents(id) ON DELETE CASCADE UNIQUE,
    theme VARCHAR(10) DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
    language VARCHAR(5) DEFAULT 'es',
    timezone VARCHAR(50),
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sound_enabled BOOLEAN DEFAULT TRUE,
    auto_refresh BOOLEAN DEFAULT TRUE,
    auto_assign BOOLEAN DEFAULT TRUE,
    notification_schedule_start TIME,
    notification_schedule_end TIME,
    sla_alert_frequency INTEGER DEFAULT 15,
    show_online_status BOOLEAN DEFAULT TRUE,
    share_stats BOOLEAN DEFAULT TRUE,
    activity_visible BOOLEAN DEFAULT TRUE,
    signature TEXT,
    away_message TEXT,
    out_of_hours_message TEXT,
    auto_greeting TEXT,
    auto_closing_message TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_agent_settings_agent_id ON support_agent_settings(agent_id);
