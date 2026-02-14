-- Logs de operaciones en tiempo real
CREATE TABLE IF NOT EXISTS real_time_operation_logs (
    id SERIAL PRIMARY KEY,
    trade_id INTEGER NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    direction VARCHAR(10) NOT NULL,
    amount DECIMAL(18,8) NOT NULL,
    result VARCHAR(20) DEFAULT 'pending',
    profit DECIMAL(18,8),
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason VARCHAR(200),
    open_time TIMESTAMP NOT NULL,
    close_time TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_real_time_operation_logs_trade ON real_time_operation_logs(trade_id);
CREATE INDEX IF NOT EXISTS idx_real_time_operation_logs_user ON real_time_operation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_real_time_operation_logs_flagged ON real_time_operation_logs(is_flagged);
