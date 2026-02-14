-- Copy Trading - Traders
CREATE TABLE IF NOT EXISTS copy_traders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    min_copy_amount DECIMAL(18,8) DEFAULT 100,
    profit_share DECIMAL(5,2) DEFAULT 20,
    total_copiers INTEGER DEFAULT 0,
    total_profit DECIMAL(18,8) DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy Trading - Relaciones
CREATE TABLE IF NOT EXISTS copy_relationships (
    id SERIAL PRIMARY KEY,
    copier_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    trader_id INTEGER REFERENCES copy_traders(id) ON DELETE CASCADE,
    copy_amount DECIMAL(18,8) NOT NULL,
    copy_percentage DECIMAL(5,2) DEFAULT 100,
    total_profit DECIMAL(18,8) DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stopped_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_copy_traders_user_id ON copy_traders(user_id);
CREATE INDEX IF NOT EXISTS idx_copy_relationships_copier_id ON copy_relationships(copier_id);
CREATE INDEX IF NOT EXISTS idx_copy_relationships_trader_id ON copy_relationships(trader_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_copy_relationships_unique ON copy_relationships(copier_id, trader_id);
