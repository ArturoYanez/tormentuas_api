-- Configuración del contador
CREATE TABLE IF NOT EXISTS accountant_settings (
    id SERIAL PRIMARY KEY,
    accountant_id INTEGER REFERENCES accountants(id) ON DELETE CASCADE UNIQUE,
    timezone VARCHAR(100) DEFAULT 'Europe/Madrid',
    language VARCHAR(10) DEFAULT 'es',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    currency_format VARCHAR(20) DEFAULT 'USD',
    theme VARCHAR(20) DEFAULT 'dark',
    sidebar_collapsed BOOLEAN DEFAULT false,
    dashboard_layout JSONB DEFAULT '{}',
    default_view VARCHAR(50) DEFAULT 'dashboard',
    items_per_page INTEGER DEFAULT 25,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accountant_settings_accountant ON accountant_settings(accountant_id);
