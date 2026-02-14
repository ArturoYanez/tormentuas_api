-- Categorías de tickets configurables
CREATE TABLE IF NOT EXISTS ticket_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    slug VARCHAR(100) UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    sla_hours INTEGER,
    default_priority VARCHAR(20),
    auto_assign_to INTEGER REFERENCES support_agents(id),
    parent_id INTEGER REFERENCES ticket_categories(id),
    display_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'ticket_categories' AND column_name = 'slug'
    ) THEN
        ALTER TABLE ticket_categories ADD COLUMN slug VARCHAR(100) UNIQUE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ticket_categories_slug ON ticket_categories(slug);
