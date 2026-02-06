-- Migration 019: Operator Asset Configuration + Team Chat Tables
-- Part 5: Asset management, trading pairs config, team communication

-- ========== ASSET CONFIGURATION ==========

-- Asset Categories (categorías de activos)
CREATE TABLE IF NOT EXISTS operator_asset_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT REFERENCES operators(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trading Assets (activos de trading configurables)
CREATE TABLE IF NOT EXISTS operator_trading_assets (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category_id BIGINT REFERENCES operator_asset_categories(id),
    asset_type VARCHAR(30) DEFAULT 'crypto', -- 'crypto', 'forex', 'stock', 'commodity', 'index'
    base_currency VARCHAR(10),
    quote_currency VARCHAR(10),
    min_trade_amount DECIMAL(20, 8) DEFAULT 1,
    max_trade_amount DECIMAL(20, 8) DEFAULT 10000,
    min_duration_seconds INT DEFAULT 30,
    max_duration_seconds INT DEFAULT 3600,
    payout_percentage DECIMAL(5, 2) DEFAULT 85.00,
    spread DECIMAL(10, 6) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    trading_hours_start TIME,
    trading_hours_end TIME,
    trading_days INT[] DEFAULT '{1,2,3,4,5}', -- días de la semana (1=lunes)
    risk_level VARCHAR(20) DEFAULT 'medium',
    volatility_index DECIMAL(5, 2),
    icon_url VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_by BIGINT REFERENCES operators(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset Payout Rules (reglas de payout por activo)
CREATE TABLE IF NOT EXISTS operator_asset_payout_rules (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT NOT NULL REFERENCES operator_trading_assets(id),
    rule_name VARCHAR(100) NOT NULL,
    condition_type VARCHAR(50) NOT NULL, -- 'time_of_day', 'volatility', 'volume', 'duration'
    condition_value JSONB NOT NULL,
    payout_adjustment DECIMAL(5, 2) NOT NULL, -- ajuste al payout base (puede ser negativo)
    is_active BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 0,
    created_by BIGINT REFERENCES operators(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset Trading Restrictions (restricciones de trading por activo)
CREATE TABLE IF NOT EXISTS operator_asset_restrictions (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT NOT NULL REFERENCES operator_trading_assets(id),
    restriction_type VARCHAR(50) NOT NULL, -- 'user_level', 'country', 'time', 'volume'
    restriction_value JSONB NOT NULL,
    reason TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_by BIGINT REFERENCES operators(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset Price Overrides (sobrescrituras de precio temporales)
CREATE TABLE IF NOT EXISTS operator_asset_price_overrides (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT NOT NULL REFERENCES operator_trading_assets(id),
    operator_id BIGINT NOT NULL REFERENCES operators(id),
    override_type VARCHAR(30) NOT NULL, -- 'fixed', 'adjustment', 'spread'
    override_value DECIMAL(20, 8) NOT NULL,
    reason TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    approved_by BIGINT REFERENCES operators(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset Change Log (historial de cambios en activos)
CREATE TABLE IF NOT EXISTS operator_asset_changelog (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT NOT NULL REFERENCES operator_trading_assets(id),
    operator_id BIGINT NOT NULL REFERENCES operators(id),
    change_type VARCHAR(50) NOT NULL,
    previous_value JSONB,
    new_value JSONB,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== TEAM CHAT ==========

-- Team Chat Channels (canales de chat del equipo)
CREATE TABLE IF NOT EXISTS operator_chat_channels (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    channel_type VARCHAR(30) DEFAULT 'public', -- 'public', 'private', 'department', 'direct'
    department VARCHAR(50),
    created_by BIGINT REFERENCES operators(id),
    is_archived BOOLEAN DEFAULT FALSE,
    is_readonly BOOLEAN DEFAULT FALSE,
    max_members INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channel Members (miembros de canales)
CREATE TABLE IF NOT EXISTS operator_channel_members (
    id BIGSERIAL PRIMARY KEY,
    channel_id BIGINT NOT NULL REFERENCES operator_chat_channels(id),
    operator_id BIGINT NOT NULL REFERENCES operators(id),
    role VARCHAR(30) DEFAULT 'member', -- 'owner', 'admin', 'member'
    notifications_enabled BOOLEAN DEFAULT TRUE,
    is_muted BOOLEAN DEFAULT FALSE,
    muted_until TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(channel_id, operator_id)
);

-- Chat Messages (mensajes de chat)
CREATE TABLE IF NOT EXISTS operator_chat_messages (
    id BIGSERIAL PRIMARY KEY,
    channel_id BIGINT NOT NULL REFERENCES operator_chat_channels(id),
    sender_id BIGINT NOT NULL REFERENCES operators(id),
    message_type VARCHAR(30) DEFAULT 'text', -- 'text', 'file', 'image', 'system', 'alert'
    content TEXT NOT NULL,
    reply_to_id BIGINT REFERENCES operator_chat_messages(id),
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    is_pinned BOOLEAN DEFAULT FALSE,
    pinned_by BIGINT REFERENCES operators(id),
    pinned_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message Attachments (archivos adjuntos)
CREATE TABLE IF NOT EXISTS operator_message_attachments (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES operator_chat_messages(id),
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    thumbnail_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message Reactions (reacciones a mensajes)
CREATE TABLE IF NOT EXISTS operator_message_reactions (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES operator_chat_messages(id),
    operator_id BIGINT NOT NULL REFERENCES operators(id),
    emoji VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, operator_id, emoji)
);

-- Message Mentions (menciones en mensajes)
CREATE TABLE IF NOT EXISTS operator_message_mentions (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES operator_chat_messages(id),
    mentioned_operator_id BIGINT NOT NULL REFERENCES operators(id),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Direct Messages (mensajes directos entre operadores)
CREATE TABLE IF NOT EXISTS operator_direct_messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES operators(id),
    recipient_id BIGINT NOT NULL REFERENCES operators(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    is_deleted_by_sender BOOLEAN DEFAULT FALSE,
    is_deleted_by_recipient BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_operator_trading_assets_category ON operator_trading_assets(category_id);
CREATE INDEX IF NOT EXISTS idx_operator_trading_assets_active ON operator_trading_assets(is_active);
CREATE INDEX IF NOT EXISTS idx_operator_trading_assets_type ON operator_trading_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_operator_asset_payout_rules_asset ON operator_asset_payout_rules(asset_id);
CREATE INDEX IF NOT EXISTS idx_operator_asset_restrictions_asset ON operator_asset_restrictions(asset_id);
CREATE INDEX IF NOT EXISTS idx_operator_chat_channels_type ON operator_chat_channels(channel_type);
CREATE INDEX IF NOT EXISTS idx_operator_channel_members_channel ON operator_channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_operator_channel_members_operator ON operator_channel_members(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_chat_messages_channel ON operator_chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_operator_chat_messages_sender ON operator_chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_operator_chat_messages_created ON operator_chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_operator_message_mentions_operator ON operator_message_mentions(mentioned_operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_direct_messages_sender ON operator_direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_operator_direct_messages_recipient ON operator_direct_messages(recipient_id);
