-- Retenciones de impuestos
CREATE TABLE IF NOT EXISTS tax_withholdings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL,
    transaction_id INTEGER,
    tax_config_id INTEGER REFERENCES tax_configurations(id),
    gross_amount DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,4) NOT NULL,
    tax_amount DECIMAL(15,2) NOT NULL,
    net_amount DECIMAL(15,2) NOT NULL,
    withheld_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reported BOOLEAN DEFAULT false,
    reported_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tax_withholdings_user ON tax_withholdings(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_withholdings_config ON tax_withholdings(tax_config_id);
CREATE INDEX IF NOT EXISTS idx_tax_withholdings_date ON tax_withholdings(withheld_at);
