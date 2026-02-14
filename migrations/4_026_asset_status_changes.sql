-- Historial de cambios de estado de activos
CREATE TABLE IF NOT EXISTS asset_status_changes (
    id SERIAL PRIMARY KEY,
    trading_pair_id INTEGER NOT NULL,
    operator_id INTEGER REFERENCES operators(id),
    previous_status BOOLEAN,
    new_status BOOLEAN NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_asset_status_changes_pair ON asset_status_changes(trading_pair_id);
CREATE INDEX IF NOT EXISTS idx_asset_status_changes_date ON asset_status_changes(created_at);
