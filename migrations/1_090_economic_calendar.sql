-- Calendario económico
CREATE TABLE IF NOT EXISTS economic_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    country VARCHAR(50),
    currency VARCHAR(10),
    impact VARCHAR(20),
    forecast VARCHAR(50),
    previous VARCHAR(50),
    actual VARCHAR(50),
    event_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alertas de eventos económicos del usuario
CREATE TABLE IF NOT EXISTS user_economic_alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES economic_events(id),
    alert_before_minutes INTEGER DEFAULT 15,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_economic_events_event_time ON economic_events(event_time);
CREATE INDEX IF NOT EXISTS idx_economic_events_impact ON economic_events(impact);
CREATE INDEX IF NOT EXISTS idx_user_economic_alerts_user_id ON user_economic_alerts(user_id);
