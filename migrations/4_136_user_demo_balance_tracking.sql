-- Seguimiento de balance demo de usuarios
CREATE TABLE IF NOT EXISTS user_demo_balance_tracking (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    previous_balance DECIMAL(18,8) NOT NULL,
    new_balance DECIMAL(18,8) NOT NULL,
    change_type VARCHAR(50) NOT NULL,
    change_reason TEXT,
    operator_id INTEGER REFERENCES operators(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_demo_balance_tracking_user ON user_demo_balance_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_user_demo_balance_tracking_date ON user_demo_balance_tracking(created_at);
