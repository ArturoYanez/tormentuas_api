-- Comparaciones de activos guardadas
CREATE TABLE IF NOT EXISTS chart_comparisons (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    primary_symbol VARCHAR(20) NOT NULL,
    secondary_symbol VARCHAR(20) NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chart_comparisons_user_id ON chart_comparisons(user_id);
