-- Cola de procesamiento de retiros
CREATE TABLE IF NOT EXISTS withdrawal_processing_queue (
    id SERIAL PRIMARY KEY,
    withdrawal_id INTEGER REFERENCES withdrawal_requests(id) ON DELETE CASCADE,
    assigned_to INTEGER REFERENCES accountants(id),
    priority INTEGER DEFAULT 5,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'queued',
    attempts INTEGER DEFAULT 0,
    last_error TEXT
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_queue_withdrawal ON withdrawal_processing_queue(withdrawal_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_queue_assigned ON withdrawal_processing_queue(assigned_to);
CREATE INDEX IF NOT EXISTS idx_withdrawal_queue_status ON withdrawal_processing_queue(status);
