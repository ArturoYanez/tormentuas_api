-- Snapshot de usuarios activos
CREATE TABLE IF NOT EXISTS active_users_snapshot (
    id SERIAL PRIMARY KEY,
    snapshot_time TIMESTAMP NOT NULL,
    total_active INTEGER DEFAULT 0,
    trading_now INTEGER DEFAULT 0,
    in_tournament INTEGER DEFAULT 0,
    by_country JSONB DEFAULT '{}',
    by_device JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_active_users_snapshot_time ON active_users_snapshot(snapshot_time);
