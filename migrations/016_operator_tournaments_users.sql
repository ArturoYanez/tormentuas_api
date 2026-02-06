-- Migration 016: Operator Tables - Tournaments & Users Management
-- Gestión de Torneos y Usuarios por Operador

-- 1. OPERATOR_TOURNAMENT_ACTIONS (Acciones del operador sobre torneos)
CREATE TABLE IF NOT EXISTS operator_tournament_actions (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE SET NULL,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TOURNAMENT_OPERATOR_ASSIGNMENTS (Asignación de torneos a operadores)
CREATE TABLE IF NOT EXISTS tournament_operator_assignments (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'monitor',
    assigned_by INTEGER REFERENCES operators(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, operator_id)
);

-- 3. PARTICIPANT_DISQUALIFICATIONS (Descalificaciones de participantes)
CREATE TABLE IF NOT EXISTS participant_disqualifications (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    participant_id INTEGER,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    evidence JSONB DEFAULT '[]',
    is_permanent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TOURNAMENT_MANUAL_ADDITIONS (Adiciones manuales de usuarios a torneos)
CREATE TABLE IF NOT EXISTS tournament_manual_additions (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id) ON DELETE SET NULL,
    reason TEXT,
    waived_entry_fee BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. USER_NOTES (Notas del operador sobre usuarios)
CREATE TABLE IF NOT EXISTS operator_user_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id) ON DELETE SET NULL,
    note TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. USER_BALANCE_ADJUSTMENTS (Ajustes de balance por operadores)
CREATE TABLE IF NOT EXISTS operator_balance_adjustments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id) ON DELETE SET NULL,
    wallet_type VARCHAR(20) DEFAULT 'real',
    adjustment_type VARCHAR(20) NOT NULL,
    amount DECIMAL(18,8) NOT NULL,
    previous_balance DECIMAL(18,8),
    new_balance DECIMAL(18,8),
    reason TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'other',
    approved_by INTEGER REFERENCES operators(id),
    approved_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. USER_STATUS_CHANGES (Cambios de estado de usuarios)
CREATE TABLE IF NOT EXISTS user_status_changes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id) ON DELETE SET NULL,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    reason TEXT NOT NULL,
    duration_hours INTEGER,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. USER_TRADING_BLOCKS (Bloqueos de trading de usuarios)
CREATE TABLE IF NOT EXISTS user_trading_blocks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id) ON DELETE SET NULL,
    block_type VARCHAR(20) DEFAULT 'full',
    blocked_symbols JSONB DEFAULT '[]',
    max_amount DECIMAL(18,8),
    reason TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. USER_RISK_ASSESSMENTS (Evaluaciones de riesgo de usuarios)
CREATE TABLE IF NOT EXISTS user_risk_assessments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id) ON DELETE SET NULL,
    previous_level VARCHAR(20),
    new_level VARCHAR(20) NOT NULL,
    factors JSONB DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. MONITORED_USERS (Usuarios bajo monitoreo especial)
CREATE TABLE IF NOT EXISTS monitored_users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER REFERENCES operators(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    monitoring_type VARCHAR(30) DEFAULT 'all_activity',
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, operator_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tournament_actions_operator ON operator_tournament_actions(operator_id);
CREATE INDEX IF NOT EXISTS idx_tournament_actions_tournament ON operator_tournament_actions(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_assignments_tournament ON tournament_operator_assignments(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_assignments_operator ON tournament_operator_assignments(operator_id);
CREATE INDEX IF NOT EXISTS idx_disqualifications_tournament ON participant_disqualifications(tournament_id);
CREATE INDEX IF NOT EXISTS idx_disqualifications_user ON participant_disqualifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_user ON operator_user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_operator ON operator_user_notes(operator_id);
CREATE INDEX IF NOT EXISTS idx_balance_adjustments_user ON operator_balance_adjustments(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_adjustments_status ON operator_balance_adjustments(status);
CREATE INDEX IF NOT EXISTS idx_status_changes_user ON user_status_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_blocks_user ON user_trading_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_blocks_active ON user_trading_blocks(is_active);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_user ON user_risk_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_monitored_users_active ON monitored_users(is_active);
