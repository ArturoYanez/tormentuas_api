-- Estadísticas por tipo de operación
CREATE TABLE IF NOT EXISTS operation_type_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    buy_count INTEGER DEFAULT 0,
    sell_count INTEGER DEFAULT 0,
    buy_volume DECIMAL(18,8) DEFAULT 0,
    sell_volume DECIMAL(18,8) DEFAULT 0,
    buy_wins INTEGER DEFAULT 0,
    sell_wins INTEGER DEFAULT 0,
    buy_losses INTEGER DEFAULT 0,
    sell_losses INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operation_type_stats_date ON operation_type_stats(date);
CREATE INDEX IF NOT EXISTS idx_operation_type_stats_symbol ON operation_type_stats(symbol);
