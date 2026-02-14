-- Historial de navegación del operador
CREATE TABLE IF NOT EXISTS operator_navigation_history (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    view VARCHAR(50) NOT NULL,
    previous_view VARCHAR(50),
    time_spent INTEGER,
    navigated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operator_navigation_history_operator ON operator_navigation_history(operator_id);
