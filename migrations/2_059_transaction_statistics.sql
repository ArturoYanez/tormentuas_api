-- Estadísticas de transacciones
CREATE TABLE IF NOT EXISTS transaction_statistics (
    id SERIAL PRIMARY KEY,
    stat_date DATE NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    total_count INTEGER DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    average_amount DECIMAL(15,2) DEFAULT 0,
    min_amount DECIMAL(15,2),
    max_amount DECIMAL(15,2),
    approved_count INTEGER DEFAULT 0,
    rejected_count INTEGER DEFAULT 0,
    pending_count INTEGER DEFAULT 0,
    average_processing_time INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(stat_date, transaction_type)
);

CREATE INDEX IF NOT EXISTS idx_transaction_statistics_date ON transaction_statistics(stat_date);
CREATE INDEX IF NOT EXISTS idx_transaction_statistics_type ON transaction_statistics(transaction_type);
