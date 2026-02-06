package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// OperatorRepository maneja las operaciones de BD para el operador
type OperatorRepository struct {
	pool *pgxpool.Pool
}

// NewOperatorRepository crea un nuevo repositorio
func NewOperatorRepository(pool *pgxpool.Pool) *OperatorRepository {
	return &OperatorRepository{pool: pool}
}

// ========== DASHBOARD STATS ==========

// OperatorDashboardStats estadísticas del dashboard del operador
type OperatorDashboardStats struct {
	ActiveUsers        int     `json:"active_users"`
	TotalTradesToday   int     `json:"total_trades_today"`
	ActiveTrades       int     `json:"active_trades"`
	PendingAlerts      int     `json:"pending_alerts"`
	ActiveTournaments  int     `json:"active_tournaments"`
	TotalVolumeToday   float64 `json:"total_volume_today"`
	WinRate            float64 `json:"win_rate"`
	FlaggedTrades      int     `json:"flagged_trades"`
	MonitoredUsers     int     `json:"monitored_users"`
	OnlineOperators    int     `json:"online_operators"`
}

// GetDashboardStats obtiene estadísticas del dashboard
func (r *OperatorRepository) GetDashboardStats(ctx context.Context) (*OperatorDashboardStats, error) {
	stats := &OperatorDashboardStats{}

	// Active users (last 24h)
	r.pool.QueryRow(ctx, "SELECT COUNT(DISTINCT user_id) FROM trades WHERE created_at > NOW() - INTERVAL '24 hours'").Scan(&stats.ActiveUsers)

	// Total trades today
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM trades WHERE DATE(created_at) = CURRENT_DATE").Scan(&stats.TotalTradesToday)

	// Active trades
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM trades WHERE status = 'active'").Scan(&stats.ActiveTrades)

	// Pending alerts
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM operator_alerts WHERE is_resolved = false").Scan(&stats.PendingAlerts)

	// Active tournaments
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM tournaments WHERE status = 'active'").Scan(&stats.ActiveTournaments)

	// Total volume today
	r.pool.QueryRow(ctx, "SELECT COALESCE(SUM(amount), 0) FROM trades WHERE DATE(created_at) = CURRENT_DATE").Scan(&stats.TotalVolumeToday)

	// Win rate today
	var wins, total int
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM trades WHERE DATE(created_at) = CURRENT_DATE AND result = 'won'").Scan(&wins)
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM trades WHERE DATE(created_at) = CURRENT_DATE AND result IN ('won', 'lost')").Scan(&total)
	if total > 0 {
		stats.WinRate = float64(wins) / float64(total) * 100
	}

	// Flagged trades
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM trade_flags WHERE is_resolved = false").Scan(&stats.FlaggedTrades)

	// Monitored users
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM monitored_users WHERE is_active = true").Scan(&stats.MonitoredUsers)

	// Online operators
	r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM operators WHERE status IN ('available', 'busy') AND is_active = true").Scan(&stats.OnlineOperators)

	return stats, nil
}

// ========== OPERATORS ==========

// Operator operador
type Operator struct {
	ID            int64      `json:"id"`
	UserID        *int64     `json:"user_id"`
	EmployeeID    string     `json:"employee_id"`
	FirstName     string     `json:"first_name"`
	LastName      string     `json:"last_name"`
	Email         string     `json:"email"`
	Phone         string     `json:"phone"`
	AvatarURL     string     `json:"avatar_url"`
	Department    string     `json:"department"`
	Position      string     `json:"position"`
	Status        string     `json:"status"`
	StatusMessage string     `json:"status_message"`
	IsActive      bool       `json:"is_active"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

// GetOperators obtiene lista de operadores
func (r *OperatorRepository) GetOperators(ctx context.Context, department, status string, limit int) ([]*Operator, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT id, user_id, employee_id, COALESCE(first_name, '') as first_name, COALESCE(last_name, '') as last_name,
			email, COALESCE(phone, '') as phone, COALESCE(avatar_url, '') as avatar_url, department,
			COALESCE(position, '') as position, status, COALESCE(status_message, '') as status_message,
			is_active, created_at, updated_at
		FROM operators WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1

	if department != "" && department != "all" {
		query += fmt.Sprintf(" AND department = $%d", argNum)
		args = append(args, department)
		argNum++
	}
	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND status = $%d", argNum)
		args = append(args, status)
		argNum++
	}

	query += fmt.Sprintf(" ORDER BY first_name, last_name LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var operators []*Operator
	for rows.Next() {
		o := &Operator{}
		if err := rows.Scan(&o.ID, &o.UserID, &o.EmployeeID, &o.FirstName, &o.LastName, &o.Email, &o.Phone,
			&o.AvatarURL, &o.Department, &o.Position, &o.Status, &o.StatusMessage, &o.IsActive,
			&o.CreatedAt, &o.UpdatedAt); err != nil {
			return nil, err
		}
		operators = append(operators, o)
	}
	return operators, nil
}

// GetOperatorByID obtiene un operador por ID
func (r *OperatorRepository) GetOperatorByID(ctx context.Context, id int64) (*Operator, error) {
	o := &Operator{}
	err := r.pool.QueryRow(ctx, `
		SELECT id, user_id, employee_id, COALESCE(first_name, '') as first_name, COALESCE(last_name, '') as last_name,
			email, COALESCE(phone, '') as phone, COALESCE(avatar_url, '') as avatar_url, department,
			COALESCE(position, '') as position, status, COALESCE(status_message, '') as status_message,
			is_active, created_at, updated_at
		FROM operators WHERE id = $1
	`, id).Scan(&o.ID, &o.UserID, &o.EmployeeID, &o.FirstName, &o.LastName, &o.Email, &o.Phone,
		&o.AvatarURL, &o.Department, &o.Position, &o.Status, &o.StatusMessage, &o.IsActive,
		&o.CreatedAt, &o.UpdatedAt)
	return o, err
}

// GetOperatorByUserID obtiene un operador por user_id
func (r *OperatorRepository) GetOperatorByUserID(ctx context.Context, userID int64) (*Operator, error) {
	o := &Operator{}
	err := r.pool.QueryRow(ctx, `
		SELECT id, user_id, employee_id, COALESCE(first_name, '') as first_name, COALESCE(last_name, '') as last_name,
			email, COALESCE(phone, '') as phone, COALESCE(avatar_url, '') as avatar_url, department,
			COALESCE(position, '') as position, status, COALESCE(status_message, '') as status_message,
			is_active, created_at, updated_at
		FROM operators WHERE user_id = $1
	`, userID).Scan(&o.ID, &o.UserID, &o.EmployeeID, &o.FirstName, &o.LastName, &o.Email, &o.Phone,
		&o.AvatarURL, &o.Department, &o.Position, &o.Status, &o.StatusMessage, &o.IsActive,
		&o.CreatedAt, &o.UpdatedAt)
	return o, err
}

// UpdateOperatorStatus actualiza el estado del operador
func (r *OperatorRepository) UpdateOperatorStatus(ctx context.Context, operatorID int64, status, statusMessage string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operators SET status = $1, status_message = $2, updated_at = NOW() WHERE id = $3
	`, status, statusMessage, operatorID)
	return err
}

// ========== OPERATOR SESSIONS ==========

// OperatorSession sesión del operador
type OperatorSession struct {
	ID           int64      `json:"id"`
	OperatorID   int64      `json:"operator_id"`
	Device       string     `json:"device"`
	Browser      string     `json:"browser"`
	OS           string     `json:"os"`
	IPAddress    string     `json:"ip_address"`
	Location     string     `json:"location"`
	IsCurrent    bool       `json:"is_current"`
	LastActiveAt time.Time  `json:"last_active_at"`
	CreatedAt    time.Time  `json:"created_at"`
	ExpiresAt    *time.Time `json:"expires_at"`
}

// GetOperatorSessions obtiene sesiones del operador
func (r *OperatorRepository) GetOperatorSessions(ctx context.Context, operatorID int64) ([]*OperatorSession, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, operator_id, COALESCE(device, '') as device, COALESCE(browser, '') as browser,
			COALESCE(os, '') as os, COALESCE(ip_address, '') as ip, COALESCE(location, '') as location,
			is_current, last_active_at, created_at, expires_at
		FROM operator_sessions
		WHERE operator_id = $1 AND (expires_at IS NULL OR expires_at > NOW())
		ORDER BY last_active_at DESC
	`, operatorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []*OperatorSession
	for rows.Next() {
		s := &OperatorSession{}
		if err := rows.Scan(&s.ID, &s.OperatorID, &s.Device, &s.Browser, &s.OS, &s.IPAddress, &s.Location,
			&s.IsCurrent, &s.LastActiveAt, &s.CreatedAt, &s.ExpiresAt); err != nil {
			return nil, err
		}
		sessions = append(sessions, s)
	}
	return sessions, nil
}

// InvalidateOperatorSession invalida una sesión
func (r *OperatorRepository) InvalidateOperatorSession(ctx context.Context, sessionID, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM operator_sessions WHERE id = $1 AND operator_id = $2`, sessionID, operatorID)
	return err
}

// InvalidateAllOperatorSessions invalida todas las sesiones excepto la actual
func (r *OperatorRepository) InvalidateAllOperatorSessions(ctx context.Context, operatorID int64, currentSessionID int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM operator_sessions WHERE operator_id = $1 AND id != $2`, operatorID, currentSessionID)
	return err
}

// ========== OPERATOR SETTINGS ==========

// OperatorSettings configuración del operador
type OperatorSettings struct {
	ID                   int64   `json:"id"`
	OperatorID           int64   `json:"operator_id"`
	Theme                string  `json:"theme"`
	Language             string  `json:"language"`
	Timezone             string  `json:"timezone"`
	NotificationsEnabled bool    `json:"notifications_enabled"`
	AutoRefresh          bool    `json:"auto_refresh"`
	SoundAlerts          bool    `json:"sound_alerts"`
	EmailAlerts          bool    `json:"email_alerts"`
	FontSize             string  `json:"font_size"`
	Density              string  `json:"density"`
	DoNotDisturb         bool    `json:"do_not_disturb"`
	DoNotDisturbStart    *string `json:"do_not_disturb_start"`
	DoNotDisturbEnd      *string `json:"do_not_disturb_end"`
	SessionTimeout       int     `json:"session_timeout"`
}

// GetOperatorSettings obtiene configuración del operador
func (r *OperatorRepository) GetOperatorSettings(ctx context.Context, operatorID int64) (*OperatorSettings, error) {
	s := &OperatorSettings{}
	err := r.pool.QueryRow(ctx, `
		SELECT id, operator_id, theme, language, timezone, notifications_enabled, auto_refresh,
			sound_alerts, email_alerts, font_size, density, do_not_disturb,
			do_not_disturb_start::text, do_not_disturb_end::text, session_timeout
		FROM operator_settings WHERE operator_id = $1
	`, operatorID).Scan(&s.ID, &s.OperatorID, &s.Theme, &s.Language, &s.Timezone, &s.NotificationsEnabled,
		&s.AutoRefresh, &s.SoundAlerts, &s.EmailAlerts, &s.FontSize, &s.Density, &s.DoNotDisturb,
		&s.DoNotDisturbStart, &s.DoNotDisturbEnd, &s.SessionTimeout)
	if err != nil {
		// Crear configuración por defecto
		r.pool.Exec(ctx, `
			INSERT INTO operator_settings (operator_id) VALUES ($1) ON CONFLICT (operator_id) DO NOTHING
		`, operatorID)
		return &OperatorSettings{
			OperatorID:           operatorID,
			Theme:                "dark",
			Language:             "es",
			Timezone:             "Europe/Madrid",
			NotificationsEnabled: true,
			AutoRefresh:          true,
			SoundAlerts:          false,
			EmailAlerts:          true,
			FontSize:             "medium",
			Density:              "normal",
			SessionTimeout:       30,
		}, nil
	}
	return s, nil
}

// UpdateOperatorSettings actualiza configuración
func (r *OperatorRepository) UpdateOperatorSettings(ctx context.Context, operatorID int64, settings *OperatorSettings) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO operator_settings (operator_id, theme, language, timezone, notifications_enabled, auto_refresh, sound_alerts, email_alerts, font_size, density, do_not_disturb, session_timeout)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		ON CONFLICT (operator_id) DO UPDATE SET
			theme = EXCLUDED.theme, language = EXCLUDED.language, timezone = EXCLUDED.timezone,
			notifications_enabled = EXCLUDED.notifications_enabled, auto_refresh = EXCLUDED.auto_refresh,
			sound_alerts = EXCLUDED.sound_alerts, email_alerts = EXCLUDED.email_alerts,
			font_size = EXCLUDED.font_size, density = EXCLUDED.density, do_not_disturb = EXCLUDED.do_not_disturb,
			session_timeout = EXCLUDED.session_timeout, updated_at = NOW()
	`, operatorID, settings.Theme, settings.Language, settings.Timezone, settings.NotificationsEnabled,
		settings.AutoRefresh, settings.SoundAlerts, settings.EmailAlerts, settings.FontSize, settings.Density,
		settings.DoNotDisturb, settings.SessionTimeout)
	return err
}

// ========== OPERATOR WORK SCHEDULE ==========

// OperatorWorkSchedule horario de trabajo
type OperatorWorkSchedule struct {
	ID           int64  `json:"id"`
	OperatorID   int64  `json:"operator_id"`
	DayOfWeek    int    `json:"day_of_week"`
	StartTime    string `json:"start_time"`
	EndTime      string `json:"end_time"`
	IsWorkingDay bool   `json:"is_working_day"`
}

// GetOperatorWorkSchedule obtiene horario de trabajo
func (r *OperatorRepository) GetOperatorWorkSchedule(ctx context.Context, operatorID int64) ([]*OperatorWorkSchedule, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, operator_id, day_of_week, start_time::text, end_time::text, is_working_day
		FROM operator_work_schedule WHERE operator_id = $1 ORDER BY day_of_week
	`, operatorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var schedule []*OperatorWorkSchedule
	for rows.Next() {
		s := &OperatorWorkSchedule{}
		if err := rows.Scan(&s.ID, &s.OperatorID, &s.DayOfWeek, &s.StartTime, &s.EndTime, &s.IsWorkingDay); err != nil {
			return nil, err
		}
		schedule = append(schedule, s)
	}
	return schedule, nil
}

// UpdateOperatorWorkSchedule actualiza horario de trabajo
func (r *OperatorRepository) UpdateOperatorWorkSchedule(ctx context.Context, operatorID int64, dayOfWeek int, startTime, endTime string, isWorkingDay bool) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO operator_work_schedule (operator_id, day_of_week, start_time, end_time, is_working_day)
		VALUES ($1, $2, $3::time, $4::time, $5)
		ON CONFLICT (operator_id, day_of_week) DO UPDATE SET
			start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_working_day = EXCLUDED.is_working_day
	`, operatorID, dayOfWeek, startTime, endTime, isWorkingDay)
	return err
}

// ========== ROLES & PERMISSIONS ==========

// OperatorRole rol de operador
type OperatorRole struct {
	ID          int64    `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Permissions []string `json:"permissions"`
	IsActive    bool     `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
}

// GetOperatorRoles obtiene roles disponibles
func (r *OperatorRepository) GetOperatorRoles(ctx context.Context) ([]*OperatorRole, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, name, COALESCE(description, '') as description, permissions, is_active, created_at
		FROM operator_roles WHERE is_active = true ORDER BY name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roles []*OperatorRole
	for rows.Next() {
		role := &OperatorRole{}
		if err := rows.Scan(&role.ID, &role.Name, &role.Description, &role.Permissions, &role.IsActive, &role.CreatedAt); err != nil {
			return nil, err
		}
		roles = append(roles, role)
	}
	return roles, nil
}

// GetOperatorAssignedRoles obtiene roles asignados a un operador
func (r *OperatorRepository) GetOperatorAssignedRoles(ctx context.Context, operatorID int64) ([]*OperatorRole, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT r.id, r.name, COALESCE(r.description, '') as description, r.permissions, r.is_active, r.created_at
		FROM operator_roles r
		INNER JOIN operator_role_assignments ra ON r.id = ra.role_id
		WHERE ra.operator_id = $1 AND r.is_active = true
		ORDER BY r.name
	`, operatorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roles []*OperatorRole
	for rows.Next() {
		role := &OperatorRole{}
		if err := rows.Scan(&role.ID, &role.Name, &role.Description, &role.Permissions, &role.IsActive, &role.CreatedAt); err != nil {
			return nil, err
		}
		roles = append(roles, role)
	}
	return roles, nil
}

// AssignRoleToOperator asigna un rol a un operador
func (r *OperatorRepository) AssignRoleToOperator(ctx context.Context, operatorID, roleID, grantedBy int64) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO operator_role_assignments (operator_id, role_id, granted_by)
		VALUES ($1, $2, $3) ON CONFLICT (operator_id, role_id) DO NOTHING
	`, operatorID, roleID, grantedBy)
	return err
}

// RemoveRoleFromOperator remueve un rol de un operador
func (r *OperatorRepository) RemoveRoleFromOperator(ctx context.Context, operatorID, roleID int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM operator_role_assignments WHERE operator_id = $1 AND role_id = $2`, operatorID, roleID)
	return err
}

// OperatorPermission permiso
type OperatorPermission struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Code        string `json:"code"`
	Category    string `json:"category"`
	Description string `json:"description"`
}

// GetAllPermissions obtiene todos los permisos disponibles
func (r *OperatorRepository) GetAllPermissions(ctx context.Context) ([]*OperatorPermission, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, name, code, COALESCE(category, '') as category, COALESCE(description, '') as description
		FROM operator_permission_catalog WHERE is_active = true ORDER BY category, name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var permissions []*OperatorPermission
	for rows.Next() {
		p := &OperatorPermission{}
		if err := rows.Scan(&p.ID, &p.Name, &p.Code, &p.Category, &p.Description); err != nil {
			return nil, err
		}
		permissions = append(permissions, p)
	}
	return permissions, nil
}

// GetOperatorPermissions obtiene permisos efectivos del operador (de roles + directos)
func (r *OperatorRepository) GetOperatorPermissions(ctx context.Context, operatorID int64) ([]string, error) {
	// Obtener permisos de roles
	rows, err := r.pool.Query(ctx, `
		SELECT DISTINCT jsonb_array_elements_text(r.permissions)
		FROM operator_roles r
		INNER JOIN operator_role_assignments ra ON r.id = ra.role_id
		WHERE ra.operator_id = $1 AND r.is_active = true
	`, operatorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	permSet := make(map[string]bool)
	for rows.Next() {
		var perm string
		if err := rows.Scan(&perm); err != nil {
			return nil, err
		}
		permSet[perm] = true
	}

	// Obtener permisos directos
	rows2, err := r.pool.Query(ctx, `
		SELECT pc.code FROM operator_permission_catalog pc
		INNER JOIN operator_permissions op ON pc.id = op.permission_id
		WHERE op.operator_id = $1 AND pc.is_active = true
	`, operatorID)
	if err != nil {
		return nil, err
	}
	defer rows2.Close()

	for rows2.Next() {
		var perm string
		if err := rows2.Scan(&perm); err != nil {
			return nil, err
		}
		permSet[perm] = true
	}

	permissions := make([]string, 0, len(permSet))
	for perm := range permSet {
		permissions = append(permissions, perm)
	}
	return permissions, nil
}


// ========== TOURNAMENT MANAGEMENT ==========

// TournamentAction acción sobre torneo
type TournamentAction struct {
	ID           int64     `json:"id"`
	OperatorID   int64     `json:"operator_id"`
	OperatorName string    `json:"operator_name"`
	TournamentID int64     `json:"tournament_id"`
	TournamentName string  `json:"tournament_name"`
	Action       string    `json:"action"`
	Reason       string    `json:"reason"`
	CreatedAt    time.Time `json:"created_at"`
}

// GetTournamentActions obtiene acciones sobre torneos
func (r *OperatorRepository) GetTournamentActions(ctx context.Context, tournamentID int64, limit int) ([]*TournamentAction, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT ta.id, ta.operator_id, COALESCE(o.first_name || ' ' || o.last_name, 'Sistema') as operator_name,
			ta.tournament_id, COALESCE(t.name, 'Torneo') as tournament_name, ta.action,
			COALESCE(ta.reason, '') as reason, ta.created_at
		FROM operator_tournament_actions ta
		LEFT JOIN operators o ON ta.operator_id = o.id
		LEFT JOIN tournaments t ON ta.tournament_id = t.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if tournamentID > 0 {
		query += fmt.Sprintf(" AND ta.tournament_id = $%d", argNum)
		args = append(args, tournamentID)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY ta.created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var actions []*TournamentAction
	for rows.Next() {
		a := &TournamentAction{}
		if err := rows.Scan(&a.ID, &a.OperatorID, &a.OperatorName, &a.TournamentID, &a.TournamentName,
			&a.Action, &a.Reason, &a.CreatedAt); err != nil {
			return nil, err
		}
		actions = append(actions, a)
	}
	return actions, nil
}

// LogTournamentAction registra una acción sobre torneo
func (r *OperatorRepository) LogTournamentAction(ctx context.Context, operatorID, tournamentID int64, action, reason string) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO operator_tournament_actions (operator_id, tournament_id, action, reason)
		VALUES ($1, $2, $3, $4)
	`, operatorID, tournamentID, action, reason)
	return err
}


// TournamentAssignment asignación de torneo a operador
type TournamentAssignment struct {
	ID             int64     `json:"id"`
	TournamentID   int64     `json:"tournament_id"`
	TournamentName string    `json:"tournament_name"`
	OperatorID     int64     `json:"operator_id"`
	OperatorName   string    `json:"operator_name"`
	Role           string    `json:"role"`
	AssignedBy     *int64    `json:"assigned_by"`
	AssignedByName *string   `json:"assigned_by_name"`
	AssignedAt     time.Time `json:"assigned_at"`
}

// GetTournamentAssignments obtiene asignaciones de torneos
func (r *OperatorRepository) GetTournamentAssignments(ctx context.Context, operatorID int64) ([]*TournamentAssignment, error) {
	query := `
		SELECT ta.id, ta.tournament_id, COALESCE(t.name, 'Torneo') as tournament_name,
			ta.operator_id, COALESCE(o.first_name || ' ' || o.last_name, '') as operator_name,
			ta.role, ta.assigned_by, COALESCE(ab.first_name || ' ' || ab.last_name, NULL) as assigned_by_name,
			ta.assigned_at
		FROM tournament_operator_assignments ta
		LEFT JOIN tournaments t ON ta.tournament_id = t.id
		LEFT JOIN operators o ON ta.operator_id = o.id
		LEFT JOIN operators ab ON ta.assigned_by = ab.id
		WHERE ta.operator_id = $1
		ORDER BY ta.assigned_at DESC
	`
	rows, err := r.pool.Query(ctx, query, operatorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var assignments []*TournamentAssignment
	for rows.Next() {
		a := &TournamentAssignment{}
		if err := rows.Scan(&a.ID, &a.TournamentID, &a.TournamentName, &a.OperatorID, &a.OperatorName,
			&a.Role, &a.AssignedBy, &a.AssignedByName, &a.AssignedAt); err != nil {
			return nil, err
		}
		assignments = append(assignments, a)
	}
	return assignments, nil
}

// AssignTournamentToOperator asigna un torneo a un operador
func (r *OperatorRepository) AssignTournamentToOperator(ctx context.Context, tournamentID, operatorID int64, role string, assignedBy int64) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO tournament_operator_assignments (tournament_id, operator_id, role, assigned_by)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (tournament_id, operator_id) DO UPDATE SET role = EXCLUDED.role
	`, tournamentID, operatorID, role, assignedBy)
	return err
}


// ParticipantDisqualification descalificación de participante
type ParticipantDisqualification struct {
	ID            int64     `json:"id"`
	TournamentID  int64     `json:"tournament_id"`
	TournamentName string   `json:"tournament_name"`
	UserID        int64     `json:"user_id"`
	UserName      string    `json:"user_name"`
	UserEmail     string    `json:"user_email"`
	OperatorID    int64     `json:"operator_id"`
	OperatorName  string    `json:"operator_name"`
	Reason        string    `json:"reason"`
	IsPermanent   bool      `json:"is_permanent"`
	CreatedAt     time.Time `json:"created_at"`
}

// GetDisqualifications obtiene descalificaciones
func (r *OperatorRepository) GetDisqualifications(ctx context.Context, tournamentID int64, limit int) ([]*ParticipantDisqualification, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT pd.id, pd.tournament_id, COALESCE(t.name, 'Torneo') as tournament_name,
			pd.user_id, COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			COALESCE(u.email, '') as user_email, COALESCE(pd.operator_id, 0) as operator_id,
			COALESCE(o.first_name || ' ' || o.last_name, 'Sistema') as operator_name,
			pd.reason, pd.is_permanent, pd.created_at
		FROM participant_disqualifications pd
		LEFT JOIN tournaments t ON pd.tournament_id = t.id
		LEFT JOIN users u ON pd.user_id = u.id
		LEFT JOIN operators o ON pd.operator_id = o.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if tournamentID > 0 {
		query += fmt.Sprintf(" AND pd.tournament_id = $%d", argNum)
		args = append(args, tournamentID)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY pd.created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var disqualifications []*ParticipantDisqualification
	for rows.Next() {
		d := &ParticipantDisqualification{}
		if err := rows.Scan(&d.ID, &d.TournamentID, &d.TournamentName, &d.UserID, &d.UserName, &d.UserEmail,
			&d.OperatorID, &d.OperatorName, &d.Reason, &d.IsPermanent, &d.CreatedAt); err != nil {
			return nil, err
		}
		disqualifications = append(disqualifications, d)
	}
	return disqualifications, nil
}

// DisqualifyParticipant descalifica un participante
func (r *OperatorRepository) DisqualifyParticipant(ctx context.Context, tournamentID, userID, operatorID int64, reason string, isPermanent bool) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO participant_disqualifications (tournament_id, user_id, operator_id, reason, is_permanent)
		VALUES ($1, $2, $3, $4, $5)
	`, tournamentID, userID, operatorID, reason, isPermanent)
	return err
}

// AddUserToTournament agrega manualmente un usuario a un torneo
func (r *OperatorRepository) AddUserToTournament(ctx context.Context, tournamentID, userID, operatorID int64, reason string, waiveFee bool) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO tournament_manual_additions (tournament_id, user_id, operator_id, reason, waived_entry_fee)
		VALUES ($1, $2, $3, $4, $5)
	`, tournamentID, userID, operatorID, reason, waiveFee)
	return err
}


// ========== USER MANAGEMENT ==========

// UserNote nota sobre usuario
type UserNote struct {
	ID           int64     `json:"id"`
	UserID       int64     `json:"user_id"`
	UserName     string    `json:"user_name"`
	OperatorID   int64     `json:"operator_id"`
	OperatorName string    `json:"operator_name"`
	Note         string    `json:"note"`
	Priority     string    `json:"priority"`
	IsPinned     bool      `json:"is_pinned"`
	CreatedAt    time.Time `json:"created_at"`
}

// GetUserNotes obtiene notas de un usuario
func (r *OperatorRepository) GetUserNotes(ctx context.Context, userID int64) ([]*UserNote, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT n.id, n.user_id, COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			COALESCE(n.operator_id, 0) as operator_id, COALESCE(o.first_name || ' ' || o.last_name, 'Sistema') as operator_name,
			n.note, n.priority, n.is_pinned, n.created_at
		FROM operator_user_notes n
		LEFT JOIN users u ON n.user_id = u.id
		LEFT JOIN operators o ON n.operator_id = o.id
		WHERE n.user_id = $1
		ORDER BY n.is_pinned DESC, n.created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notes []*UserNote
	for rows.Next() {
		n := &UserNote{}
		if err := rows.Scan(&n.ID, &n.UserID, &n.UserName, &n.OperatorID, &n.OperatorName,
			&n.Note, &n.Priority, &n.IsPinned, &n.CreatedAt); err != nil {
			return nil, err
		}
		notes = append(notes, n)
	}
	return notes, nil
}

// AddUserNote agrega una nota a un usuario
func (r *OperatorRepository) AddUserNote(ctx context.Context, userID, operatorID int64, note, priority string, isPinned bool) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_user_notes (user_id, operator_id, note, priority, is_pinned)
		VALUES ($1, $2, $3, $4, $5) RETURNING id
	`, userID, operatorID, note, priority, isPinned).Scan(&id)
	return id, err
}

// DeleteUserNote elimina una nota
func (r *OperatorRepository) DeleteUserNote(ctx context.Context, noteID, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM operator_user_notes WHERE id = $1 AND operator_id = $2`, noteID, operatorID)
	return err
}


// BalanceAdjustment ajuste de balance
type BalanceAdjustment struct {
	ID              int64      `json:"id"`
	UserID          int64      `json:"user_id"`
	UserName        string     `json:"user_name"`
	OperatorID      int64      `json:"operator_id"`
	OperatorName    string     `json:"operator_name"`
	WalletType      string     `json:"wallet_type"`
	AdjustmentType  string     `json:"adjustment_type"`
	Amount          float64    `json:"amount"`
	PreviousBalance float64    `json:"previous_balance"`
	NewBalance      float64    `json:"new_balance"`
	Reason          string     `json:"reason"`
	Category        string     `json:"category"`
	ApprovedBy      *int64     `json:"approved_by"`
	ApprovedByName  *string    `json:"approved_by_name"`
	ApprovedAt      *time.Time `json:"approved_at"`
	Status          string     `json:"status"`
	CreatedAt       time.Time  `json:"created_at"`
}

// GetBalanceAdjustments obtiene ajustes de balance
func (r *OperatorRepository) GetBalanceAdjustments(ctx context.Context, userID int64, status string, limit int) ([]*BalanceAdjustment, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT ba.id, ba.user_id, COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			COALESCE(ba.operator_id, 0) as operator_id, COALESCE(o.first_name || ' ' || o.last_name, 'Sistema') as operator_name,
			ba.wallet_type, ba.adjustment_type, ba.amount, COALESCE(ba.previous_balance, 0) as prev_balance,
			COALESCE(ba.new_balance, 0) as new_balance, ba.reason, ba.category, ba.approved_by,
			COALESCE(ab.first_name || ' ' || ab.last_name, NULL) as approved_by_name, ba.approved_at, ba.status, ba.created_at
		FROM operator_balance_adjustments ba
		LEFT JOIN users u ON ba.user_id = u.id
		LEFT JOIN operators o ON ba.operator_id = o.id
		LEFT JOIN operators ab ON ba.approved_by = ab.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if userID > 0 {
		query += fmt.Sprintf(" AND ba.user_id = $%d", argNum)
		args = append(args, userID)
		argNum++
	}
	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND ba.status = $%d", argNum)
		args = append(args, status)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY ba.created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var adjustments []*BalanceAdjustment
	for rows.Next() {
		a := &BalanceAdjustment{}
		if err := rows.Scan(&a.ID, &a.UserID, &a.UserName, &a.OperatorID, &a.OperatorName, &a.WalletType,
			&a.AdjustmentType, &a.Amount, &a.PreviousBalance, &a.NewBalance, &a.Reason, &a.Category,
			&a.ApprovedBy, &a.ApprovedByName, &a.ApprovedAt, &a.Status, &a.CreatedAt); err != nil {
			return nil, err
		}
		adjustments = append(adjustments, a)
	}
	return adjustments, nil
}

// CreateBalanceAdjustment crea un ajuste de balance
func (r *OperatorRepository) CreateBalanceAdjustment(ctx context.Context, userID, operatorID int64, walletType, adjustmentType string, amount float64, reason, category string) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_balance_adjustments (user_id, operator_id, wallet_type, adjustment_type, amount, reason, category, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending') RETURNING id
	`, userID, operatorID, walletType, adjustmentType, amount, reason, category).Scan(&id)
	return id, err
}

// ApproveBalanceAdjustment aprueba un ajuste
func (r *OperatorRepository) ApproveBalanceAdjustment(ctx context.Context, adjustmentID, approverID int64) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_balance_adjustments SET status = 'approved', approved_by = $1, approved_at = NOW()
		WHERE id = $2 AND status = 'pending'
	`, approverID, adjustmentID)
	return err
}

// RejectBalanceAdjustment rechaza un ajuste
func (r *OperatorRepository) RejectBalanceAdjustment(ctx context.Context, adjustmentID int64) error {
	_, err := r.pool.Exec(ctx, `UPDATE operator_balance_adjustments SET status = 'rejected' WHERE id = $1`, adjustmentID)
	return err
}


// UserStatusChange cambio de estado de usuario
type UserStatusChange struct {
	ID             int64      `json:"id"`
	UserID         int64      `json:"user_id"`
	UserName       string     `json:"user_name"`
	OperatorID     int64      `json:"operator_id"`
	OperatorName   string     `json:"operator_name"`
	PreviousStatus string     `json:"previous_status"`
	NewStatus      string     `json:"new_status"`
	Reason         string     `json:"reason"`
	DurationHours  *int       `json:"duration_hours"`
	ExpiresAt      *time.Time `json:"expires_at"`
	CreatedAt      time.Time  `json:"created_at"`
}

// GetUserStatusChanges obtiene cambios de estado
func (r *OperatorRepository) GetUserStatusChanges(ctx context.Context, userID int64, limit int) ([]*UserStatusChange, error) {
	if limit <= 0 {
		limit = 50
	}
	rows, err := r.pool.Query(ctx, `
		SELECT sc.id, sc.user_id, COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			COALESCE(sc.operator_id, 0) as operator_id, COALESCE(o.first_name || ' ' || o.last_name, 'Sistema') as operator_name,
			COALESCE(sc.previous_status, '') as prev_status, sc.new_status, sc.reason, sc.duration_hours, sc.expires_at, sc.created_at
		FROM user_status_changes sc
		LEFT JOIN users u ON sc.user_id = u.id
		LEFT JOIN operators o ON sc.operator_id = o.id
		WHERE sc.user_id = $1
		ORDER BY sc.created_at DESC LIMIT $2
	`, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var changes []*UserStatusChange
	for rows.Next() {
		c := &UserStatusChange{}
		if err := rows.Scan(&c.ID, &c.UserID, &c.UserName, &c.OperatorID, &c.OperatorName,
			&c.PreviousStatus, &c.NewStatus, &c.Reason, &c.DurationHours, &c.ExpiresAt, &c.CreatedAt); err != nil {
			return nil, err
		}
		changes = append(changes, c)
	}
	return changes, nil
}

// ChangeUserStatus cambia el estado de un usuario
func (r *OperatorRepository) ChangeUserStatus(ctx context.Context, userID, operatorID int64, newStatus, reason string, durationHours *int) error {
	// Get current status
	var currentStatus string
	r.pool.QueryRow(ctx, "SELECT COALESCE(status, 'active') FROM users WHERE id = $1", userID).Scan(&currentStatus)

	var expiresAt *time.Time
	if durationHours != nil && *durationHours > 0 {
		t := time.Now().Add(time.Duration(*durationHours) * time.Hour)
		expiresAt = &t
	}

	// Log the change
	_, err := r.pool.Exec(ctx, `
		INSERT INTO user_status_changes (user_id, operator_id, previous_status, new_status, reason, duration_hours, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, userID, operatorID, currentStatus, newStatus, reason, durationHours, expiresAt)
	if err != nil {
		return err
	}

	// Update user status
	_, err = r.pool.Exec(ctx, "UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2", newStatus, userID)
	return err
}


// TradingBlock bloqueo de trading
type TradingBlock struct {
	ID             int64      `json:"id"`
	UserID         int64      `json:"user_id"`
	UserName       string     `json:"user_name"`
	OperatorID     int64      `json:"operator_id"`
	OperatorName   string     `json:"operator_name"`
	BlockType      string     `json:"block_type"`
	BlockedSymbols []string   `json:"blocked_symbols"`
	MaxAmount      *float64   `json:"max_amount"`
	Reason         string     `json:"reason"`
	IsActive       bool       `json:"is_active"`
	ExpiresAt      *time.Time `json:"expires_at"`
	CreatedAt      time.Time  `json:"created_at"`
}

// GetTradingBlocks obtiene bloqueos de trading
func (r *OperatorRepository) GetTradingBlocks(ctx context.Context, userID int64, activeOnly bool) ([]*TradingBlock, error) {
	query := `
		SELECT tb.id, tb.user_id, COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			COALESCE(tb.operator_id, 0) as operator_id, COALESCE(o.first_name || ' ' || o.last_name, 'Sistema') as operator_name,
			tb.block_type, COALESCE(tb.blocked_symbols, '[]') as blocked_symbols, tb.max_amount,
			tb.reason, tb.is_active, tb.expires_at, tb.created_at
		FROM user_trading_blocks tb
		LEFT JOIN users u ON tb.user_id = u.id
		LEFT JOIN operators o ON tb.operator_id = o.id
		WHERE tb.user_id = $1
	`
	if activeOnly {
		query += " AND tb.is_active = true"
	}
	query += " ORDER BY tb.created_at DESC"

	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var blocks []*TradingBlock
	for rows.Next() {
		b := &TradingBlock{}
		if err := rows.Scan(&b.ID, &b.UserID, &b.UserName, &b.OperatorID, &b.OperatorName, &b.BlockType,
			&b.BlockedSymbols, &b.MaxAmount, &b.Reason, &b.IsActive, &b.ExpiresAt, &b.CreatedAt); err != nil {
			return nil, err
		}
		blocks = append(blocks, b)
	}
	return blocks, nil
}

// CreateTradingBlock crea un bloqueo de trading
func (r *OperatorRepository) CreateTradingBlock(ctx context.Context, userID, operatorID int64, blockType, reason string, blockedSymbols []string, maxAmount *float64, expiresAt *time.Time) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO user_trading_blocks (user_id, operator_id, block_type, blocked_symbols, max_amount, reason, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
	`, userID, operatorID, blockType, blockedSymbols, maxAmount, reason, expiresAt).Scan(&id)
	return id, err
}

// RemoveTradingBlock desactiva un bloqueo
func (r *OperatorRepository) RemoveTradingBlock(ctx context.Context, blockID int64) error {
	_, err := r.pool.Exec(ctx, `UPDATE user_trading_blocks SET is_active = false WHERE id = $1`, blockID)
	return err
}


// RiskAssessment evaluación de riesgo
type RiskAssessment struct {
	ID            int64     `json:"id"`
	UserID        int64     `json:"user_id"`
	UserName      string    `json:"user_name"`
	OperatorID    int64     `json:"operator_id"`
	OperatorName  string    `json:"operator_name"`
	PreviousLevel string    `json:"previous_level"`
	NewLevel      string    `json:"new_level"`
	Factors       []string  `json:"factors"`
	Notes         string    `json:"notes"`
	CreatedAt     time.Time `json:"created_at"`
}

// GetRiskAssessments obtiene evaluaciones de riesgo
func (r *OperatorRepository) GetRiskAssessments(ctx context.Context, userID int64, limit int) ([]*RiskAssessment, error) {
	if limit <= 0 {
		limit = 20
	}
	rows, err := r.pool.Query(ctx, `
		SELECT ra.id, ra.user_id, COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			COALESCE(ra.operator_id, 0) as operator_id, COALESCE(o.first_name || ' ' || o.last_name, 'Sistema') as operator_name,
			COALESCE(ra.previous_level, '') as prev_level, ra.new_level, COALESCE(ra.factors, '[]') as factors,
			COALESCE(ra.notes, '') as notes, ra.created_at
		FROM user_risk_assessments ra
		LEFT JOIN users u ON ra.user_id = u.id
		LEFT JOIN operators o ON ra.operator_id = o.id
		WHERE ra.user_id = $1
		ORDER BY ra.created_at DESC LIMIT $2
	`, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var assessments []*RiskAssessment
	for rows.Next() {
		a := &RiskAssessment{}
		if err := rows.Scan(&a.ID, &a.UserID, &a.UserName, &a.OperatorID, &a.OperatorName,
			&a.PreviousLevel, &a.NewLevel, &a.Factors, &a.Notes, &a.CreatedAt); err != nil {
			return nil, err
		}
		assessments = append(assessments, a)
	}
	return assessments, nil
}

// CreateRiskAssessment crea una evaluación de riesgo
func (r *OperatorRepository) CreateRiskAssessment(ctx context.Context, userID, operatorID int64, newLevel, notes string, factors []string) error {
	var prevLevel string
	r.pool.QueryRow(ctx, "SELECT new_level FROM user_risk_assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1", userID).Scan(&prevLevel)

	_, err := r.pool.Exec(ctx, `
		INSERT INTO user_risk_assessments (user_id, operator_id, previous_level, new_level, factors, notes)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, userID, operatorID, prevLevel, newLevel, factors, notes)
	return err
}

// MonitoredUser usuario monitoreado
type MonitoredUser struct {
	ID             int64      `json:"id"`
	UserID         int64      `json:"user_id"`
	UserName       string     `json:"user_name"`
	UserEmail      string     `json:"user_email"`
	OperatorID     int64      `json:"operator_id"`
	OperatorName   string     `json:"operator_name"`
	Reason         string     `json:"reason"`
	Priority       string     `json:"priority"`
	MonitoringType string     `json:"monitoring_type"`
	IsActive       bool       `json:"is_active"`
	ExpiresAt      *time.Time `json:"expires_at"`
	CreatedAt      time.Time  `json:"created_at"`
}

// GetMonitoredUsers obtiene usuarios monitoreados
func (r *OperatorRepository) GetMonitoredUsers(ctx context.Context, operatorID int64, activeOnly bool, limit int) ([]*MonitoredUser, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT mu.id, mu.user_id, COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			COALESCE(u.email, '') as user_email, COALESCE(mu.operator_id, 0) as operator_id,
			COALESCE(o.first_name || ' ' || o.last_name, 'Sistema') as operator_name,
			mu.reason, mu.priority, mu.monitoring_type, mu.is_active, mu.expires_at, mu.created_at
		FROM monitored_users mu
		LEFT JOIN users u ON mu.user_id = u.id
		LEFT JOIN operators o ON mu.operator_id = o.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if operatorID > 0 {
		query += fmt.Sprintf(" AND mu.operator_id = $%d", argNum)
		args = append(args, operatorID)
		argNum++
	}
	if activeOnly {
		query += " AND mu.is_active = true"
	}
	query += fmt.Sprintf(" ORDER BY mu.priority DESC, mu.created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*MonitoredUser
	for rows.Next() {
		m := &MonitoredUser{}
		if err := rows.Scan(&m.ID, &m.UserID, &m.UserName, &m.UserEmail, &m.OperatorID, &m.OperatorName,
			&m.Reason, &m.Priority, &m.MonitoringType, &m.IsActive, &m.ExpiresAt, &m.CreatedAt); err != nil {
			return nil, err
		}
		users = append(users, m)
	}
	return users, nil
}

// AddMonitoredUser agrega un usuario a monitoreo
func (r *OperatorRepository) AddMonitoredUser(ctx context.Context, userID, operatorID int64, reason, priority, monitoringType string, expiresAt *time.Time) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO monitored_users (user_id, operator_id, reason, priority, monitoring_type, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (user_id, operator_id) DO UPDATE SET reason = EXCLUDED.reason, priority = EXCLUDED.priority, monitoring_type = EXCLUDED.monitoring_type, is_active = true, expires_at = EXCLUDED.expires_at
	`, userID, operatorID, reason, priority, monitoringType, expiresAt)
	return err
}

// RemoveMonitoredUser remueve un usuario de monitoreo
func (r *OperatorRepository) RemoveMonitoredUser(ctx context.Context, monitoredID int64) error {
	_, err := r.pool.Exec(ctx, `UPDATE monitored_users SET is_active = false WHERE id = $1`, monitoredID)
	return err
}

// ========== PART 3: TRADE CONTROL ==========

// TradeIntervention intervención en trade
type TradeIntervention struct {
	ID               int64      `json:"id"`
	TradeID          int64      `json:"trade_id"`
	OperatorID       int64      `json:"operator_id"`
	OperatorName     string     `json:"operator_name"`
	InterventionType string     `json:"intervention_type"`
	OriginalValue    string     `json:"original_value"`
	NewValue         string     `json:"new_value"`
	Reason           string     `json:"reason"`
	Status           string     `json:"status"`
	ApprovedBy       *int64     `json:"approved_by"`
	ApprovedAt       *time.Time `json:"approved_at"`
	CreatedAt        time.Time  `json:"created_at"`
}

// GetTradeInterventions obtiene intervenciones de trades
func (r *OperatorRepository) GetTradeInterventions(ctx context.Context, tradeID int64, limit int) ([]*TradeIntervention, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT ti.id, ti.trade_id, ti.operator_id, COALESCE(o.first_name || ' ' || o.last_name, 'Sistema') as operator_name,
			ti.intervention_type, COALESCE(ti.original_value::text, '{}'), COALESCE(ti.new_value::text, '{}'),
			ti.reason, ti.status, ti.approved_by, ti.approved_at, ti.created_at
		FROM trade_interventions ti
		LEFT JOIN operators o ON ti.operator_id = o.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if tradeID > 0 {
		query += fmt.Sprintf(" AND ti.trade_id = $%d", argNum)
		args = append(args, tradeID)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY ti.created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var interventions []*TradeIntervention
	for rows.Next() {
		i := &TradeIntervention{}
		if err := rows.Scan(&i.ID, &i.TradeID, &i.OperatorID, &i.OperatorName, &i.InterventionType,
			&i.OriginalValue, &i.NewValue, &i.Reason, &i.Status, &i.ApprovedBy, &i.ApprovedAt, &i.CreatedAt); err != nil {
			return nil, err
		}
		interventions = append(interventions, i)
	}
	return interventions, nil
}

// CreateTradeIntervention crea una intervención
func (r *OperatorRepository) CreateTradeIntervention(ctx context.Context, tradeID, operatorID int64, interventionType, reason string, originalValue, newValue map[string]interface{}) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO trade_interventions (trade_id, operator_id, intervention_type, original_value, new_value, reason)
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
	`, tradeID, operatorID, interventionType, originalValue, newValue, reason).Scan(&id)
	return id, err
}

// RevertTradeIntervention revierte una intervención
func (r *OperatorRepository) RevertTradeIntervention(ctx context.Context, interventionID, operatorID int64, reason string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE trade_interventions SET status = 'reverted', reverted_at = NOW(), reverted_by = $1, revert_reason = $2
		WHERE id = $3 AND status = 'applied'
	`, operatorID, reason, interventionID)
	return err
}

// TradeFlag bandera de trade
type TradeFlag struct {
	ID              int64      `json:"id"`
	TradeID         int64      `json:"trade_id"`
	UserID          int64      `json:"user_id"`
	UserName        string     `json:"user_name"`
	OperatorID      int64      `json:"operator_id"`
	OperatorName    string     `json:"operator_name"`
	FlagType        string     `json:"flag_type"`
	Severity        string     `json:"severity"`
	Reason          string     `json:"reason"`
	Evidence        string     `json:"evidence"`
	Status          string     `json:"status"`
	ResolvedBy      *int64     `json:"resolved_by"`
	ResolvedAt      *time.Time `json:"resolved_at"`
	ResolutionNotes *string    `json:"resolution_notes"`
	CreatedAt       time.Time  `json:"created_at"`
}

// GetTradeFlags obtiene banderas de trades
func (r *OperatorRepository) GetTradeFlags(ctx context.Context, status, severity string, limit int) ([]*TradeFlag, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT tf.id, tf.trade_id, tf.user_id, COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			tf.operator_id, COALESCE(o.first_name || ' ' || o.last_name, 'Sistema') as operator_name,
			tf.flag_type, tf.severity, tf.reason, COALESCE(tf.evidence::text, '{}'), tf.status,
			tf.resolved_by, tf.resolved_at, tf.resolution_notes, tf.created_at
		FROM trade_flags tf
		LEFT JOIN users u ON tf.user_id = u.id
		LEFT JOIN operators o ON tf.operator_id = o.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND tf.status = $%d", argNum)
		args = append(args, status)
		argNum++
	}
	if severity != "" && severity != "all" {
		query += fmt.Sprintf(" AND tf.severity = $%d", argNum)
		args = append(args, severity)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY tf.created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var flags []*TradeFlag
	for rows.Next() {
		f := &TradeFlag{}
		if err := rows.Scan(&f.ID, &f.TradeID, &f.UserID, &f.UserName, &f.OperatorID, &f.OperatorName,
			&f.FlagType, &f.Severity, &f.Reason, &f.Evidence, &f.Status, &f.ResolvedBy, &f.ResolvedAt,
			&f.ResolutionNotes, &f.CreatedAt); err != nil {
			return nil, err
		}
		flags = append(flags, f)
	}
	return flags, nil
}

// CreateTradeFlag crea una bandera de trade
func (r *OperatorRepository) CreateTradeFlag(ctx context.Context, tradeID, userID, operatorID int64, flagType, severity, reason string, evidence map[string]interface{}) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO trade_flags (trade_id, user_id, operator_id, flag_type, severity, reason, evidence)
		VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
	`, tradeID, userID, operatorID, flagType, severity, reason, evidence).Scan(&id)
	return id, err
}

// ResolveTradeFlag resuelve una bandera
func (r *OperatorRepository) ResolveTradeFlag(ctx context.Context, flagID, operatorID int64, notes string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE trade_flags SET status = 'resolved', resolved_by = $1, resolved_at = NOW(), resolution_notes = $2
		WHERE id = $3 AND status = 'active'
	`, operatorID, notes, flagID)
	return err
}

// DismissTradeFlag descarta una bandera
func (r *OperatorRepository) DismissTradeFlag(ctx context.Context, flagID, operatorID int64, notes string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE trade_flags SET status = 'dismissed', resolved_by = $1, resolved_at = NOW(), resolution_notes = $2
		WHERE id = $3 AND status = 'active'
	`, operatorID, notes, flagID)
	return err
}

// EscalateTradeFlag escala una bandera
func (r *OperatorRepository) EscalateTradeFlag(ctx context.Context, flagID, escalateTo int64) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE trade_flags SET status = 'escalated', escalated_to = $1, escalated_at = NOW()
		WHERE id = $2 AND status = 'active'
	`, escalateTo, flagID)
	return err
}

// TradeCancellation cancelación de trade
type TradeCancellation struct {
	ID               int64      `json:"id"`
	TradeID          int64      `json:"trade_id"`
	UserID           int64      `json:"user_id"`
	UserName         string     `json:"user_name"`
	OperatorID       int64      `json:"operator_id"`
	OperatorName     string     `json:"operator_name"`
	CancellationType string     `json:"cancellation_type"`
	OriginalAmount   float64    `json:"original_amount"`
	RefundAmount     *float64   `json:"refund_amount"`
	RefundStatus     string     `json:"refund_status"`
	Reason           string     `json:"reason"`
	UserNotified     bool       `json:"user_notified"`
	ApprovedBy       *int64     `json:"approved_by"`
	ApprovedAt       *time.Time `json:"approved_at"`
	CreatedAt        time.Time  `json:"created_at"`
	ProcessedAt      *time.Time `json:"processed_at"`
}

// GetTradeCancellations obtiene cancelaciones de trades
func (r *OperatorRepository) GetTradeCancellations(ctx context.Context, status string, limit int) ([]*TradeCancellation, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT tc.id, tc.trade_id, tc.user_id, COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			tc.operator_id, COALESCE(o.first_name || ' ' || o.last_name, 'Sistema') as operator_name,
			tc.cancellation_type, tc.original_amount, tc.refund_amount, tc.refund_status, tc.reason,
			tc.user_notified, tc.approved_by, tc.approved_at, tc.created_at, tc.processed_at
		FROM trade_cancellations tc
		LEFT JOIN users u ON tc.user_id = u.id
		LEFT JOIN operators o ON tc.operator_id = o.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND tc.refund_status = $%d", argNum)
		args = append(args, status)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY tc.created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cancellations []*TradeCancellation
	for rows.Next() {
		c := &TradeCancellation{}
		if err := rows.Scan(&c.ID, &c.TradeID, &c.UserID, &c.UserName, &c.OperatorID, &c.OperatorName,
			&c.CancellationType, &c.OriginalAmount, &c.RefundAmount, &c.RefundStatus, &c.Reason,
			&c.UserNotified, &c.ApprovedBy, &c.ApprovedAt, &c.CreatedAt, &c.ProcessedAt); err != nil {
			return nil, err
		}
		cancellations = append(cancellations, c)
	}
	return cancellations, nil
}

// CreateTradeCancellation crea una cancelación de trade
func (r *OperatorRepository) CreateTradeCancellation(ctx context.Context, tradeID, userID, operatorID int64, cancellationType string, originalAmount float64, reason string, requiresApproval bool) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO trade_cancellations (trade_id, user_id, operator_id, cancellation_type, original_amount, reason, requires_approval)
		VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
	`, tradeID, userID, operatorID, cancellationType, originalAmount, reason, requiresApproval).Scan(&id)
	return id, err
}

// ProcessTradeCancellation procesa una cancelación
func (r *OperatorRepository) ProcessTradeCancellation(ctx context.Context, cancellationID int64, refundAmount float64) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE trade_cancellations SET refund_amount = $1, refund_status = 'processed', processed_at = NOW()
		WHERE id = $2 AND refund_status = 'pending'
	`, refundAmount, cancellationID)
	return err
}

// ForcedTradeResult resultado forzado de trade
type ForcedTradeResult struct {
	ID              int64      `json:"id"`
	TradeID         int64      `json:"trade_id"`
	UserID          int64      `json:"user_id"`
	UserName        string     `json:"user_name"`
	OperatorID      int64      `json:"operator_id"`
	OperatorName    string     `json:"operator_name"`
	OriginalResult  *string    `json:"original_result"`
	ForcedResult    string     `json:"forced_result"`
	OriginalPayout  *float64   `json:"original_payout"`
	ForcedPayout    *float64   `json:"forced_payout"`
	Reason          string     `json:"reason"`
	Justification   *string    `json:"justification"`
	Status          string     `json:"status"`
	ApprovedBy      *int64     `json:"approved_by"`
	ApprovedAt      *time.Time `json:"approved_at"`
	CreatedAt       time.Time  `json:"created_at"`
}

// GetForcedTradeResults obtiene resultados forzados
func (r *OperatorRepository) GetForcedTradeResults(ctx context.Context, status string, limit int) ([]*ForcedTradeResult, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT ftr.id, ftr.trade_id, ftr.user_id, COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			ftr.operator_id, COALESCE(o.first_name || ' ' || o.last_name, 'Sistema') as operator_name,
			ftr.original_result, ftr.forced_result, ftr.original_payout, ftr.forced_payout,
			ftr.reason, ftr.justification, ftr.status, ftr.approved_by, ftr.approved_at, ftr.created_at
		FROM forced_trade_results ftr
		LEFT JOIN users u ON ftr.user_id = u.id
		LEFT JOIN operators o ON ftr.operator_id = o.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND ftr.status = $%d", argNum)
		args = append(args, status)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY ftr.created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []*ForcedTradeResult
	for rows.Next() {
		r := &ForcedTradeResult{}
		if err := rows.Scan(&r.ID, &r.TradeID, &r.UserID, &r.UserName, &r.OperatorID, &r.OperatorName,
			&r.OriginalResult, &r.ForcedResult, &r.OriginalPayout, &r.ForcedPayout, &r.Reason,
			&r.Justification, &r.Status, &r.ApprovedBy, &r.ApprovedAt, &r.CreatedAt); err != nil {
			return nil, err
		}
		results = append(results, r)
	}
	return results, nil
}

// CreateForcedTradeResult crea un resultado forzado
func (r *OperatorRepository) CreateForcedTradeResult(ctx context.Context, tradeID, userID, operatorID int64, forcedResult, reason, justification string, forcedPayout *float64, requiresSeniorApproval bool) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO forced_trade_results (trade_id, user_id, operator_id, forced_result, forced_payout, reason, justification, requires_senior_approval)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
	`, tradeID, userID, operatorID, forcedResult, forcedPayout, reason, justification, requiresSeniorApproval).Scan(&id)
	return id, err
}

// ApproveForcedResult aprueba un resultado forzado
func (r *OperatorRepository) ApproveForcedResult(ctx context.Context, resultID, approverID int64) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE forced_trade_results SET status = 'applied', approved_by = $1, approved_at = NOW()
		WHERE id = $2 AND status = 'pending_review'
	`, approverID, resultID)
	return err
}

// RevertForcedResult revierte un resultado forzado
func (r *OperatorRepository) RevertForcedResult(ctx context.Context, resultID, operatorID int64, reason string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE forced_trade_results SET status = 'reverted', reverted_at = NOW(), reverted_by = $1, revert_reason = $2
		WHERE id = $3 AND status = 'applied'
	`, operatorID, reason, resultID)
	return err
}

// TradeReviewItem item en cola de revisión
type TradeReviewItem struct {
	ID            int64      `json:"id"`
	TradeID       int64      `json:"trade_id"`
	UserID        int64      `json:"user_id"`
	UserName      string     `json:"user_name"`
	QueueType     string     `json:"queue_type"`
	Priority      string     `json:"priority"`
	Reason        string     `json:"reason"`
	AutoFlagRules []string   `json:"auto_flag_rules"`
	AssignedTo    *int64     `json:"assigned_to"`
	AssignedName  *string    `json:"assigned_name"`
	Status        string     `json:"status"`
	ReviewedBy    *int64     `json:"reviewed_by"`
	ReviewedAt    *time.Time `json:"reviewed_at"`
	ReviewNotes   *string    `json:"review_notes"`
	ActionTaken   *string    `json:"action_taken"`
	CreatedAt     time.Time  `json:"created_at"`
	DueAt         *time.Time `json:"due_at"`
}

// GetTradeReviewQueue obtiene cola de revisión
func (r *OperatorRepository) GetTradeReviewQueue(ctx context.Context, status, priority string, limit int) ([]*TradeReviewItem, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT trq.id, trq.trade_id, trq.user_id, COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			trq.queue_type, trq.priority, trq.reason, COALESCE(trq.auto_flag_rules, '{}') as auto_flag_rules,
			trq.assigned_to, COALESCE(o.first_name || ' ' || o.last_name, NULL) as assigned_name,
			trq.status, trq.reviewed_by, trq.reviewed_at, trq.review_notes, trq.action_taken, trq.created_at, trq.due_at
		FROM trade_review_queue trq
		LEFT JOIN users u ON trq.user_id = u.id
		LEFT JOIN operators o ON trq.assigned_to = o.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND trq.status = $%d", argNum)
		args = append(args, status)
		argNum++
	}
	if priority != "" && priority != "all" {
		query += fmt.Sprintf(" AND trq.priority = $%d", argNum)
		args = append(args, priority)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY CASE trq.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END, trq.created_at ASC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*TradeReviewItem
	for rows.Next() {
		i := &TradeReviewItem{}
		if err := rows.Scan(&i.ID, &i.TradeID, &i.UserID, &i.UserName, &i.QueueType, &i.Priority, &i.Reason,
			&i.AutoFlagRules, &i.AssignedTo, &i.AssignedName, &i.Status, &i.ReviewedBy, &i.ReviewedAt,
			&i.ReviewNotes, &i.ActionTaken, &i.CreatedAt, &i.DueAt); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	return items, nil
}

// AssignTradeReview asigna un item de revisión
func (r *OperatorRepository) AssignTradeReview(ctx context.Context, reviewID, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE trade_review_queue SET assigned_to = $1, assigned_at = NOW(), status = 'in_review'
		WHERE id = $2 AND status = 'pending'
	`, operatorID, reviewID)
	return err
}

// CompleteTradeReview completa una revisión
func (r *OperatorRepository) CompleteTradeReview(ctx context.Context, reviewID, operatorID int64, notes, actionTaken string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE trade_review_queue SET status = 'completed', reviewed_by = $1, reviewed_at = NOW(), review_notes = $2, action_taken = $3
		WHERE id = $4 AND status = 'in_review'
	`, operatorID, notes, actionTaken, reviewID)
	return err
}

// TradePattern patrón de trading detectado
type TradePattern struct {
	ID                int64      `json:"id"`
	UserID            int64      `json:"user_id"`
	UserName          string     `json:"user_name"`
	PatternType       string     `json:"pattern_type"`
	DetectedBy        *int64     `json:"detected_by"`
	DetectedByName    *string    `json:"detected_by_name"`
	DetectionMethod   string     `json:"detection_method"`
	ConfidenceScore   *float64   `json:"confidence_score"`
	AffectedTrades    []int64    `json:"affected_trades"`
	PatternData       string     `json:"pattern_data"`
	Status            string     `json:"status"`
	InvestigatedBy    *int64     `json:"investigated_by"`
	InvestigationNotes *string   `json:"investigation_notes"`
	ActionTaken       *string    `json:"action_taken"`
	CreatedAt         time.Time  `json:"created_at"`
}

// GetTradePatterns obtiene patrones detectados
func (r *OperatorRepository) GetTradePatterns(ctx context.Context, patternType, status string, limit int) ([]*TradePattern, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT tp.id, tp.user_id, COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			tp.pattern_type, tp.detected_by, COALESCE(o.first_name || ' ' || o.last_name, NULL) as detected_by_name,
			tp.detection_method, tp.confidence_score, COALESCE(tp.affected_trades, '{}') as affected_trades,
			COALESCE(tp.pattern_data::text, '{}'), tp.status, tp.investigated_by, tp.investigation_notes, tp.action_taken, tp.created_at
		FROM trade_patterns tp
		LEFT JOIN users u ON tp.user_id = u.id
		LEFT JOIN operators o ON tp.detected_by = o.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if patternType != "" && patternType != "all" {
		query += fmt.Sprintf(" AND tp.pattern_type = $%d", argNum)
		args = append(args, patternType)
		argNum++
	}
	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND tp.status = $%d", argNum)
		args = append(args, status)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY tp.created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var patterns []*TradePattern
	for rows.Next() {
		p := &TradePattern{}
		if err := rows.Scan(&p.ID, &p.UserID, &p.UserName, &p.PatternType, &p.DetectedBy, &p.DetectedByName,
			&p.DetectionMethod, &p.ConfidenceScore, &p.AffectedTrades, &p.PatternData, &p.Status,
			&p.InvestigatedBy, &p.InvestigationNotes, &p.ActionTaken, &p.CreatedAt); err != nil {
			return nil, err
		}
		patterns = append(patterns, p)
	}
	return patterns, nil
}

// ReportTradePattern reporta un patrón manualmente
func (r *OperatorRepository) ReportTradePattern(ctx context.Context, userID, operatorID int64, patternType string, affectedTrades []int64, notes string) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO trade_patterns (user_id, pattern_type, detected_by, detection_method, affected_trades, investigation_notes, status)
		VALUES ($1, $2, $3, 'manual', $4, $5, 'investigating') RETURNING id
	`, userID, patternType, operatorID, affectedTrades, notes).Scan(&id)
	return id, err
}

// UpdatePatternStatus actualiza estado de un patrón
func (r *OperatorRepository) UpdatePatternStatus(ctx context.Context, patternID, operatorID int64, status, notes, actionTaken string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE trade_patterns SET status = $1, investigated_by = $2, investigation_notes = $3, action_taken = $4, updated_at = NOW()
		WHERE id = $5
	`, status, operatorID, notes, actionTaken, patternID)
	return err
}

// TradeLimitOverride sobrescritura de límite
type TradeLimitOverride struct {
	ID            int64      `json:"id"`
	UserID        int64      `json:"user_id"`
	UserName      string     `json:"user_name"`
	OperatorID    int64      `json:"operator_id"`
	OperatorName  string     `json:"operator_name"`
	LimitType     string     `json:"limit_type"`
	OriginalLimit *float64   `json:"original_limit"`
	NewLimit      float64    `json:"new_limit"`
	Reason        string     `json:"reason"`
	IsActive      bool       `json:"is_active"`
	StartsAt      time.Time  `json:"starts_at"`
	ExpiresAt     *time.Time `json:"expires_at"`
	ApprovedBy    *int64     `json:"approved_by"`
	ApprovedAt    *time.Time `json:"approved_at"`
	CreatedAt     time.Time  `json:"created_at"`
}

// GetTradeLimitOverrides obtiene sobrescrituras de límites
func (r *OperatorRepository) GetTradeLimitOverrides(ctx context.Context, userID int64, activeOnly bool, limit int) ([]*TradeLimitOverride, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT tlo.id, tlo.user_id, COALESCE(u.first_name || ' ' || u.last_name, 'Usuario') as user_name,
			tlo.operator_id, COALESCE(o.first_name || ' ' || o.last_name, 'Sistema') as operator_name,
			tlo.limit_type, tlo.original_limit, tlo.new_limit, tlo.reason, tlo.is_active,
			tlo.starts_at, tlo.expires_at, tlo.approved_by, tlo.approved_at, tlo.created_at
		FROM trade_limits_override tlo
		LEFT JOIN users u ON tlo.user_id = u.id
		LEFT JOIN operators o ON tlo.operator_id = o.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if userID > 0 {
		query += fmt.Sprintf(" AND tlo.user_id = $%d", argNum)
		args = append(args, userID)
		argNum++
	}
	if activeOnly {
		query += " AND tlo.is_active = true"
	}
	query += fmt.Sprintf(" ORDER BY tlo.created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var overrides []*TradeLimitOverride
	for rows.Next() {
		o := &TradeLimitOverride{}
		if err := rows.Scan(&o.ID, &o.UserID, &o.UserName, &o.OperatorID, &o.OperatorName, &o.LimitType,
			&o.OriginalLimit, &o.NewLimit, &o.Reason, &o.IsActive, &o.StartsAt, &o.ExpiresAt,
			&o.ApprovedBy, &o.ApprovedAt, &o.CreatedAt); err != nil {
			return nil, err
		}
		overrides = append(overrides, o)
	}
	return overrides, nil
}

// CreateTradeLimitOverride crea una sobrescritura de límite
func (r *OperatorRepository) CreateTradeLimitOverride(ctx context.Context, userID, operatorID int64, limitType string, newLimit float64, reason string, expiresAt *time.Time) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO trade_limits_override (user_id, operator_id, limit_type, new_limit, reason, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
	`, userID, operatorID, limitType, newLimit, reason, expiresAt).Scan(&id)
	return id, err
}

// DeactivateTradeLimitOverride desactiva una sobrescritura
func (r *OperatorRepository) DeactivateTradeLimitOverride(ctx context.Context, overrideID, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE trade_limits_override SET is_active = false, deactivated_at = NOW(), deactivated_by = $1
		WHERE id = $2 AND is_active = true
	`, operatorID, overrideID)
	return err
}


// ========== PART 4: ALERT SYSTEM ==========

// OperatorAlert alerta del sistema
type OperatorAlert struct {
	ID              int64      `json:"id"`
	AlertType       string     `json:"alert_type"`
	Severity        string     `json:"severity"`
	Title           string     `json:"title"`
	Message         string     `json:"message"`
	Source          string     `json:"source"`
	SourceID        *int64     `json:"source_id"`
	SourceType      *string    `json:"source_type"`
	UserID          *int64     `json:"user_id"`
	UserName        *string    `json:"user_name"`
	AssignedTo      *int64     `json:"assigned_to"`
	AssignedName    *string    `json:"assigned_name"`
	Status          string     `json:"status"`
	AcknowledgedBy  *int64     `json:"acknowledged_by"`
	AcknowledgedAt  *time.Time `json:"acknowledged_at"`
	ResolvedBy      *int64     `json:"resolved_by"`
	ResolvedAt      *time.Time `json:"resolved_at"`
	ResolutionNotes *string    `json:"resolution_notes"`
	IsRead          bool       `json:"is_read"`
	Priority        int        `json:"priority"`
	CreatedAt       time.Time  `json:"created_at"`
}

// GetOperatorAlerts obtiene alertas
func (r *OperatorRepository) GetOperatorAlerts(ctx context.Context, alertType, severity, status string, assignedTo int64, limit int) ([]*OperatorAlert, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT a.id, a.alert_type, a.severity, a.title, a.message, a.source, a.source_id, a.source_type,
			a.user_id, COALESCE(u.first_name || ' ' || u.last_name, NULL) as user_name,
			a.assigned_to, COALESCE(o.first_name || ' ' || o.last_name, NULL) as assigned_name,
			a.status, a.acknowledged_by, a.acknowledged_at, a.resolved_by, a.resolved_at,
			a.resolution_notes, a.is_read, a.priority, a.created_at
		FROM operator_alerts a
		LEFT JOIN users u ON a.user_id = u.id
		LEFT JOIN operators o ON a.assigned_to = o.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if alertType != "" && alertType != "all" {
		query += fmt.Sprintf(" AND a.alert_type = $%d", argNum)
		args = append(args, alertType)
		argNum++
	}
	if severity != "" && severity != "all" {
		query += fmt.Sprintf(" AND a.severity = $%d", argNum)
		args = append(args, severity)
		argNum++
	}
	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND a.status = $%d", argNum)
		args = append(args, status)
		argNum++
	}
	if assignedTo > 0 {
		query += fmt.Sprintf(" AND a.assigned_to = $%d", argNum)
		args = append(args, assignedTo)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY a.priority ASC, a.created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var alerts []*OperatorAlert
	for rows.Next() {
		a := &OperatorAlert{}
		if err := rows.Scan(&a.ID, &a.AlertType, &a.Severity, &a.Title, &a.Message, &a.Source,
			&a.SourceID, &a.SourceType, &a.UserID, &a.UserName, &a.AssignedTo, &a.AssignedName,
			&a.Status, &a.AcknowledgedBy, &a.AcknowledgedAt, &a.ResolvedBy, &a.ResolvedAt,
			&a.ResolutionNotes, &a.IsRead, &a.Priority, &a.CreatedAt); err != nil {
			return nil, err
		}
		alerts = append(alerts, a)
	}
	return alerts, nil
}

// GetAlertByID obtiene una alerta por ID
func (r *OperatorRepository) GetAlertByID(ctx context.Context, alertID int64) (*OperatorAlert, error) {
	a := &OperatorAlert{}
	err := r.pool.QueryRow(ctx, `
		SELECT a.id, a.alert_type, a.severity, a.title, a.message, a.source, a.source_id, a.source_type,
			a.user_id, COALESCE(u.first_name || ' ' || u.last_name, NULL) as user_name,
			a.assigned_to, COALESCE(o.first_name || ' ' || o.last_name, NULL) as assigned_name,
			a.status, a.acknowledged_by, a.acknowledged_at, a.resolved_by, a.resolved_at,
			a.resolution_notes, a.is_read, a.priority, a.created_at
		FROM operator_alerts a
		LEFT JOIN users u ON a.user_id = u.id
		LEFT JOIN operators o ON a.assigned_to = o.id
		WHERE a.id = $1
	`, alertID).Scan(&a.ID, &a.AlertType, &a.Severity, &a.Title, &a.Message, &a.Source,
		&a.SourceID, &a.SourceType, &a.UserID, &a.UserName, &a.AssignedTo, &a.AssignedName,
		&a.Status, &a.AcknowledgedBy, &a.AcknowledgedAt, &a.ResolvedBy, &a.ResolvedAt,
		&a.ResolutionNotes, &a.IsRead, &a.Priority, &a.CreatedAt)
	return a, err
}

// CreateOperatorAlert crea una alerta
func (r *OperatorRepository) CreateOperatorAlert(ctx context.Context, alertType, severity, title, message, source string, sourceID *int64, sourceType *string, userID *int64, priority int) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_alerts (alert_type, severity, title, message, source, source_id, source_type, user_id, priority)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
	`, alertType, severity, title, message, source, sourceID, sourceType, userID, priority).Scan(&id)
	return id, err
}

// AcknowledgeAlert reconoce una alerta
func (r *OperatorRepository) AcknowledgeAlert(ctx context.Context, alertID, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_alerts SET status = 'acknowledged', acknowledged_by = $1, acknowledged_at = NOW(), is_read = true, updated_at = NOW()
		WHERE id = $2 AND status = 'new'
	`, operatorID, alertID)
	return err
}

// AssignAlert asigna una alerta a un operador
func (r *OperatorRepository) AssignAlert(ctx context.Context, alertID, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_alerts SET assigned_to = $1, assigned_at = NOW(), status = CASE WHEN status = 'new' THEN 'acknowledged' ELSE status END, updated_at = NOW()
		WHERE id = $2
	`, operatorID, alertID)
	return err
}

// ResolveAlert resuelve una alerta
func (r *OperatorRepository) ResolveAlert(ctx context.Context, alertID, operatorID int64, notes string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_alerts SET status = 'resolved', resolved_by = $1, resolved_at = NOW(), resolution_notes = $2, updated_at = NOW()
		WHERE id = $3 AND status IN ('new', 'acknowledged', 'in_progress')
	`, operatorID, notes, alertID)
	return err
}

// DismissAlert descarta una alerta
func (r *OperatorRepository) DismissAlert(ctx context.Context, alertID, operatorID int64, notes string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_alerts SET status = 'dismissed', resolved_by = $1, resolved_at = NOW(), resolution_notes = $2, updated_at = NOW()
		WHERE id = $3 AND status IN ('new', 'acknowledged')
	`, operatorID, notes, alertID)
	return err
}

// MarkAlertRead marca una alerta como leída
func (r *OperatorRepository) MarkAlertRead(ctx context.Context, alertID int64) error {
	_, err := r.pool.Exec(ctx, `UPDATE operator_alerts SET is_read = true WHERE id = $1`, alertID)
	return err
}

// GetUnreadAlertCount obtiene conteo de alertas no leídas
func (r *OperatorRepository) GetUnreadAlertCount(ctx context.Context, operatorID int64) (int, error) {
	var count int
	err := r.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM operator_alerts WHERE (assigned_to = $1 OR assigned_to IS NULL) AND is_read = false AND status NOT IN ('resolved', 'dismissed')
	`, operatorID).Scan(&count)
	return count, err
}

// AlertRule regla de alerta
type AlertRule struct {
	ID                   int64     `json:"id"`
	Name                 string    `json:"name"`
	Description          *string   `json:"description"`
	RuleType             string    `json:"rule_type"`
	TriggerEvent         string    `json:"trigger_event"`
	Conditions           string    `json:"conditions"`
	AlertType            string    `json:"alert_type"`
	AlertSeverity        string    `json:"alert_severity"`
	AlertTitleTemplate   *string   `json:"alert_title_template"`
	AlertMessageTemplate *string   `json:"alert_message_template"`
	AutoAssignTo         *int64    `json:"auto_assign_to"`
	CooldownMinutes      int       `json:"cooldown_minutes"`
	IsActive             bool      `json:"is_active"`
	CreatedAt            time.Time `json:"created_at"`
}

// GetAlertRules obtiene reglas de alertas
func (r *OperatorRepository) GetAlertRules(ctx context.Context, activeOnly bool) ([]*AlertRule, error) {
	query := `
		SELECT id, name, description, rule_type, trigger_event, conditions::text, alert_type, alert_severity,
			alert_title_template, alert_message_template, auto_assign_to, cooldown_minutes, is_active, created_at
		FROM operator_alert_rules WHERE 1=1
	`
	if activeOnly {
		query += " AND is_active = true"
	}
	query += " ORDER BY name"

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rules []*AlertRule
	for rows.Next() {
		r := &AlertRule{}
		if err := rows.Scan(&r.ID, &r.Name, &r.Description, &r.RuleType, &r.TriggerEvent, &r.Conditions,
			&r.AlertType, &r.AlertSeverity, &r.AlertTitleTemplate, &r.AlertMessageTemplate,
			&r.AutoAssignTo, &r.CooldownMinutes, &r.IsActive, &r.CreatedAt); err != nil {
			return nil, err
		}
		rules = append(rules, r)
	}
	return rules, nil
}

// CreateAlertRule crea una regla de alerta
func (r *OperatorRepository) CreateAlertRule(ctx context.Context, name, ruleType, triggerEvent, alertType, alertSeverity string, conditions map[string]interface{}, titleTemplate, messageTemplate string, autoAssignTo *int64, cooldownMinutes int, createdBy int64) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_alert_rules (name, rule_type, trigger_event, conditions, alert_type, alert_severity, alert_title_template, alert_message_template, auto_assign_to, cooldown_minutes, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id
	`, name, ruleType, triggerEvent, conditions, alertType, alertSeverity, titleTemplate, messageTemplate, autoAssignTo, cooldownMinutes, createdBy).Scan(&id)
	return id, err
}

// ToggleAlertRule activa/desactiva una regla
func (r *OperatorRepository) ToggleAlertRule(ctx context.Context, ruleID int64) error {
	_, err := r.pool.Exec(ctx, `UPDATE operator_alert_rules SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1`, ruleID)
	return err
}

// DeleteAlertRule elimina una regla
func (r *OperatorRepository) DeleteAlertRule(ctx context.Context, ruleID int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM operator_alert_rules WHERE id = $1`, ruleID)
	return err
}

// AlertEscalation escalación de alerta
type AlertEscalation struct {
	ID              int64      `json:"id"`
	AlertID         int64      `json:"alert_id"`
	FromOperatorID  *int64     `json:"from_operator_id"`
	FromOperatorName *string   `json:"from_operator_name"`
	ToOperatorID    *int64     `json:"to_operator_id"`
	ToOperatorName  *string    `json:"to_operator_name"`
	ToDepartment    *string    `json:"to_department"`
	EscalationLevel int        `json:"escalation_level"`
	Reason          string     `json:"reason"`
	Status          string     `json:"status"`
	CreatedAt       time.Time  `json:"created_at"`
}

// EscalateAlert escala una alerta
func (r *OperatorRepository) EscalateAlert(ctx context.Context, alertID, fromOperatorID int64, toOperatorID *int64, toDepartment, reason string) error {
	// Get current escalation level
	var level int
	r.pool.QueryRow(ctx, "SELECT COALESCE(MAX(escalation_level), 0) FROM operator_alert_escalations WHERE alert_id = $1", alertID).Scan(&level)
	level++

	_, err := r.pool.Exec(ctx, `
		INSERT INTO operator_alert_escalations (alert_id, from_operator_id, to_operator_id, to_department, escalation_level, reason)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, alertID, fromOperatorID, toOperatorID, toDepartment, level, reason)
	if err != nil {
		return err
	}

	// Update alert status
	_, err = r.pool.Exec(ctx, `UPDATE operator_alerts SET status = 'escalated', assigned_to = $1, updated_at = NOW() WHERE id = $2`, toOperatorID, alertID)
	return err
}

// GetAlertEscalations obtiene escalaciones de una alerta
func (r *OperatorRepository) GetAlertEscalations(ctx context.Context, alertID int64) ([]*AlertEscalation, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT e.id, e.alert_id, e.from_operator_id, COALESCE(fo.first_name || ' ' || fo.last_name, NULL) as from_name,
			e.to_operator_id, COALESCE(too.first_name || ' ' || too.last_name, NULL) as to_name,
			e.to_department, e.escalation_level, e.reason, e.status, e.created_at
		FROM operator_alert_escalations e
		LEFT JOIN operators fo ON e.from_operator_id = fo.id
		LEFT JOIN operators too ON e.to_operator_id = too.id
		WHERE e.alert_id = $1
		ORDER BY e.escalation_level
	`, alertID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var escalations []*AlertEscalation
	for rows.Next() {
		e := &AlertEscalation{}
		if err := rows.Scan(&e.ID, &e.AlertID, &e.FromOperatorID, &e.FromOperatorName, &e.ToOperatorID,
			&e.ToOperatorName, &e.ToDepartment, &e.EscalationLevel, &e.Reason, &e.Status, &e.CreatedAt); err != nil {
			return nil, err
		}
		escalations = append(escalations, e)
	}
	return escalations, nil
}

// AlertComment comentario en alerta
type AlertComment struct {
	ID           int64     `json:"id"`
	AlertID      int64     `json:"alert_id"`
	OperatorID   int64     `json:"operator_id"`
	OperatorName string    `json:"operator_name"`
	Comment      string    `json:"comment"`
	IsInternal   bool      `json:"is_internal"`
	CreatedAt    time.Time `json:"created_at"`
}

// GetAlertComments obtiene comentarios de una alerta
func (r *OperatorRepository) GetAlertComments(ctx context.Context, alertID int64) ([]*AlertComment, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT c.id, c.alert_id, c.operator_id, COALESCE(o.first_name || ' ' || o.last_name, 'Sistema') as operator_name,
			c.comment, c.is_internal, c.created_at
		FROM operator_alert_comments c
		LEFT JOIN operators o ON c.operator_id = o.id
		WHERE c.alert_id = $1
		ORDER BY c.created_at
	`, alertID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []*AlertComment
	for rows.Next() {
		c := &AlertComment{}
		if err := rows.Scan(&c.ID, &c.AlertID, &c.OperatorID, &c.OperatorName, &c.Comment, &c.IsInternal, &c.CreatedAt); err != nil {
			return nil, err
		}
		comments = append(comments, c)
	}
	return comments, nil
}

// AddAlertComment agrega un comentario a una alerta
func (r *OperatorRepository) AddAlertComment(ctx context.Context, alertID, operatorID int64, comment string, isInternal bool) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_alert_comments (alert_id, operator_id, comment, is_internal)
		VALUES ($1, $2, $3, $4) RETURNING id
	`, alertID, operatorID, comment, isInternal).Scan(&id)
	return id, err
}

// AlertSubscription suscripción a alertas
type AlertSubscription struct {
	ID             int64    `json:"id"`
	OperatorID     int64    `json:"operator_id"`
	AlertType      string   `json:"alert_type"`
	SeverityFilter []string `json:"severity_filter"`
	NotifyEmail    bool     `json:"notify_email"`
	NotifyPush     bool     `json:"notify_push"`
	NotifySMS      bool     `json:"notify_sms"`
	IsActive       bool     `json:"is_active"`
}

// GetAlertSubscriptions obtiene suscripciones del operador
func (r *OperatorRepository) GetAlertSubscriptions(ctx context.Context, operatorID int64) ([]*AlertSubscription, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, operator_id, alert_type, COALESCE(severity_filter, '{}') as severity_filter,
			notify_email, notify_push, notify_sms, is_active
		FROM operator_alert_subscriptions
		WHERE operator_id = $1
		ORDER BY alert_type
	`, operatorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subs []*AlertSubscription
	for rows.Next() {
		s := &AlertSubscription{}
		if err := rows.Scan(&s.ID, &s.OperatorID, &s.AlertType, &s.SeverityFilter, &s.NotifyEmail, &s.NotifyPush, &s.NotifySMS, &s.IsActive); err != nil {
			return nil, err
		}
		subs = append(subs, s)
	}
	return subs, nil
}

// UpdateAlertSubscription actualiza o crea una suscripción
func (r *OperatorRepository) UpdateAlertSubscription(ctx context.Context, operatorID int64, alertType string, severityFilter []string, notifyEmail, notifyPush, notifySMS, isActive bool) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO operator_alert_subscriptions (operator_id, alert_type, severity_filter, notify_email, notify_push, notify_sms, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (operator_id, alert_type) DO UPDATE SET
			severity_filter = EXCLUDED.severity_filter, notify_email = EXCLUDED.notify_email,
			notify_push = EXCLUDED.notify_push, notify_sms = EXCLUDED.notify_sms, is_active = EXCLUDED.is_active
	`, operatorID, alertType, severityFilter, notifyEmail, notifyPush, notifySMS, isActive)
	return err
}

// AlertStats estadísticas de alertas
type AlertStats struct {
	TotalAlerts       int `json:"total_alerts"`
	NewAlerts         int `json:"new_alerts"`
	AcknowledgedAlerts int `json:"acknowledged_alerts"`
	ResolvedAlerts    int `json:"resolved_alerts"`
	EscalatedAlerts   int `json:"escalated_alerts"`
	CriticalAlerts    int `json:"critical_alerts"`
	HighAlerts        int `json:"high_alerts"`
	MediumAlerts      int `json:"medium_alerts"`
	LowAlerts         int `json:"low_alerts"`
}

// GetAlertStats obtiene estadísticas de alertas
func (r *OperatorRepository) GetAlertStats(ctx context.Context) (*AlertStats, error) {
	stats := &AlertStats{}
	err := r.pool.QueryRow(ctx, `
		SELECT 
			COUNT(*) as total,
			COUNT(*) FILTER (WHERE status = 'new') as new_alerts,
			COUNT(*) FILTER (WHERE status = 'acknowledged') as acknowledged,
			COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
			COUNT(*) FILTER (WHERE status = 'escalated') as escalated,
			COUNT(*) FILTER (WHERE severity = 'critical' AND status NOT IN ('resolved', 'dismissed')) as critical,
			COUNT(*) FILTER (WHERE severity = 'high' AND status NOT IN ('resolved', 'dismissed')) as high,
			COUNT(*) FILTER (WHERE severity = 'medium' AND status NOT IN ('resolved', 'dismissed')) as medium,
			COUNT(*) FILTER (WHERE severity = 'low' AND status NOT IN ('resolved', 'dismissed')) as low
		FROM operator_alerts
		WHERE created_at > NOW() - INTERVAL '24 hours'
	`).Scan(&stats.TotalAlerts, &stats.NewAlerts, &stats.AcknowledgedAlerts, &stats.ResolvedAlerts,
		&stats.EscalatedAlerts, &stats.CriticalAlerts, &stats.HighAlerts, &stats.MediumAlerts, &stats.LowAlerts)
	return stats, err
}


// ========== PART 5: ASSET CONFIGURATION ==========

// AssetCategory categoría de activo
type AssetCategory struct {
	ID           int64     `json:"id"`
	Name         string    `json:"name"`
	Slug         string    `json:"slug"`
	Description  *string   `json:"description"`
	Icon         *string   `json:"icon"`
	DisplayOrder int       `json:"display_order"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
}

// GetAssetCategories obtiene categorías de activos
func (r *OperatorRepository) GetAssetCategories(ctx context.Context, activeOnly bool) ([]*AssetCategory, error) {
	query := `SELECT id, name, slug, description, icon, display_order, is_active, created_at FROM operator_asset_categories WHERE 1=1`
	if activeOnly {
		query += " AND is_active = true"
	}
	query += " ORDER BY display_order, name"

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []*AssetCategory
	for rows.Next() {
		c := &AssetCategory{}
		if err := rows.Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.Icon, &c.DisplayOrder, &c.IsActive, &c.CreatedAt); err != nil {
			return nil, err
		}
		categories = append(categories, c)
	}
	return categories, nil
}

// CreateAssetCategory crea una categoría
func (r *OperatorRepository) CreateAssetCategory(ctx context.Context, name, slug string, description, icon *string, displayOrder int, createdBy int64) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_asset_categories (name, slug, description, icon, display_order, created_by)
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
	`, name, slug, description, icon, displayOrder, createdBy).Scan(&id)
	return id, err
}

// UpdateAssetCategory actualiza una categoría
func (r *OperatorRepository) UpdateAssetCategory(ctx context.Context, categoryID int64, name string, description, icon *string, displayOrder int, isActive bool) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_asset_categories SET name = $1, description = $2, icon = $3, display_order = $4, is_active = $5
		WHERE id = $6
	`, name, description, icon, displayOrder, isActive, categoryID)
	return err
}

// TradingAsset activo de trading
type TradingAsset struct {
	ID               int64    `json:"id"`
	Symbol           string   `json:"symbol"`
	Name             string   `json:"name"`
	CategoryID       *int64   `json:"category_id"`
	CategoryName     *string  `json:"category_name"`
	AssetType        string   `json:"asset_type"`
	BaseCurrency     *string  `json:"base_currency"`
	QuoteCurrency    *string  `json:"quote_currency"`
	MinTradeAmount   float64  `json:"min_trade_amount"`
	MaxTradeAmount   float64  `json:"max_trade_amount"`
	MinDuration      int      `json:"min_duration_seconds"`
	MaxDuration      int      `json:"max_duration_seconds"`
	PayoutPercentage float64  `json:"payout_percentage"`
	Spread           float64  `json:"spread"`
	IsActive         bool     `json:"is_active"`
	IsFeatured       bool     `json:"is_featured"`
	RiskLevel        string   `json:"risk_level"`
	VolatilityIndex  *float64 `json:"volatility_index"`
	IconURL          *string  `json:"icon_url"`
}

// GetTradingAssets obtiene activos de trading
func (r *OperatorRepository) GetTradingAssets(ctx context.Context, categoryID int64, assetType string, activeOnly bool, limit int) ([]*TradingAsset, error) {
	if limit <= 0 {
		limit = 100
	}
	query := `
		SELECT a.id, a.symbol, a.name, a.category_id, c.name as category_name, a.asset_type,
			a.base_currency, a.quote_currency, a.min_trade_amount, a.max_trade_amount,
			a.min_duration_seconds, a.max_duration_seconds, a.payout_percentage, a.spread,
			a.is_active, a.is_featured, a.risk_level, a.volatility_index, a.icon_url
		FROM operator_trading_assets a
		LEFT JOIN operator_asset_categories c ON a.category_id = c.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if categoryID > 0 {
		query += fmt.Sprintf(" AND a.category_id = $%d", argNum)
		args = append(args, categoryID)
		argNum++
	}
	if assetType != "" && assetType != "all" {
		query += fmt.Sprintf(" AND a.asset_type = $%d", argNum)
		args = append(args, assetType)
		argNum++
	}
	if activeOnly {
		query += " AND a.is_active = true"
	}
	query += fmt.Sprintf(" ORDER BY a.is_featured DESC, a.symbol LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var assets []*TradingAsset
	for rows.Next() {
		a := &TradingAsset{}
		if err := rows.Scan(&a.ID, &a.Symbol, &a.Name, &a.CategoryID, &a.CategoryName, &a.AssetType,
			&a.BaseCurrency, &a.QuoteCurrency, &a.MinTradeAmount, &a.MaxTradeAmount,
			&a.MinDuration, &a.MaxDuration, &a.PayoutPercentage, &a.Spread,
			&a.IsActive, &a.IsFeatured, &a.RiskLevel, &a.VolatilityIndex, &a.IconURL); err != nil {
			return nil, err
		}
		assets = append(assets, a)
	}
	return assets, nil
}

// CreateTradingAsset crea un activo de trading
func (r *OperatorRepository) CreateTradingAsset(ctx context.Context, symbol, name, assetType string, categoryID *int64, minAmount, maxAmount float64, minDuration, maxDuration int, payout, spread float64, riskLevel string, createdBy int64) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_trading_assets (symbol, name, asset_type, category_id, min_trade_amount, max_trade_amount, min_duration_seconds, max_duration_seconds, payout_percentage, spread, risk_level, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id
	`, symbol, name, assetType, categoryID, minAmount, maxAmount, minDuration, maxDuration, payout, spread, riskLevel, createdBy).Scan(&id)
	return id, err
}

// UpdateTradingAsset actualiza un activo
func (r *OperatorRepository) UpdateTradingAsset(ctx context.Context, assetID int64, name string, categoryID *int64, minAmount, maxAmount float64, minDuration, maxDuration int, payout, spread float64, riskLevel string, isActive, isFeatured bool) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_trading_assets SET name = $1, category_id = $2, min_trade_amount = $3, max_trade_amount = $4,
			min_duration_seconds = $5, max_duration_seconds = $6, payout_percentage = $7, spread = $8,
			risk_level = $9, is_active = $10, is_featured = $11, updated_at = NOW()
		WHERE id = $12
	`, name, categoryID, minAmount, maxAmount, minDuration, maxDuration, payout, spread, riskLevel, isActive, isFeatured, assetID)
	return err
}

// ToggleAssetStatus activa/desactiva un activo
func (r *OperatorRepository) ToggleAssetStatus(ctx context.Context, assetID int64) error {
	_, err := r.pool.Exec(ctx, `UPDATE operator_trading_assets SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1`, assetID)
	return err
}

// AssetPayoutRule regla de payout
type AssetPayoutRule struct {
	ID               int64   `json:"id"`
	AssetID          int64   `json:"asset_id"`
	AssetSymbol      string  `json:"asset_symbol"`
	RuleName         string  `json:"rule_name"`
	ConditionType    string  `json:"condition_type"`
	ConditionValue   string  `json:"condition_value"`
	PayoutAdjustment float64 `json:"payout_adjustment"`
	IsActive         bool    `json:"is_active"`
	Priority         int     `json:"priority"`
}

// GetAssetPayoutRules obtiene reglas de payout
func (r *OperatorRepository) GetAssetPayoutRules(ctx context.Context, assetID int64) ([]*AssetPayoutRule, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT pr.id, pr.asset_id, a.symbol, pr.rule_name, pr.condition_type, pr.condition_value::text, pr.payout_adjustment, pr.is_active, pr.priority
		FROM operator_asset_payout_rules pr
		JOIN operator_trading_assets a ON pr.asset_id = a.id
		WHERE pr.asset_id = $1
		ORDER BY pr.priority
	`, assetID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rules []*AssetPayoutRule
	for rows.Next() {
		r := &AssetPayoutRule{}
		if err := rows.Scan(&r.ID, &r.AssetID, &r.AssetSymbol, &r.RuleName, &r.ConditionType, &r.ConditionValue, &r.PayoutAdjustment, &r.IsActive, &r.Priority); err != nil {
			return nil, err
		}
		rules = append(rules, r)
	}
	return rules, nil
}

// CreateAssetPayoutRule crea una regla de payout
func (r *OperatorRepository) CreateAssetPayoutRule(ctx context.Context, assetID int64, ruleName, conditionType string, conditionValue map[string]interface{}, payoutAdjustment float64, priority int, createdBy int64) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_asset_payout_rules (asset_id, rule_name, condition_type, condition_value, payout_adjustment, priority, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
	`, assetID, ruleName, conditionType, conditionValue, payoutAdjustment, priority, createdBy).Scan(&id)
	return id, err
}

// DeleteAssetPayoutRule elimina una regla
func (r *OperatorRepository) DeleteAssetPayoutRule(ctx context.Context, ruleID int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM operator_asset_payout_rules WHERE id = $1`, ruleID)
	return err
}

// ========== TEAM CHAT ==========

// ChatChannel canal de chat
type ChatChannel struct {
	ID           int64     `json:"id"`
	Name         string    `json:"name"`
	Slug         string    `json:"slug"`
	Description  *string   `json:"description"`
	ChannelType  string    `json:"channel_type"`
	Department   *string   `json:"department"`
	IsArchived   bool      `json:"is_archived"`
	IsReadonly   bool      `json:"is_readonly"`
	MemberCount  int       `json:"member_count"`
	CreatedAt    time.Time `json:"created_at"`
}

// GetChatChannels obtiene canales de chat
func (r *OperatorRepository) GetChatChannels(ctx context.Context, operatorID int64, channelType string) ([]*ChatChannel, error) {
	query := `
		SELECT c.id, c.name, c.slug, c.description, c.channel_type, c.department, c.is_archived, c.is_readonly,
			(SELECT COUNT(*) FROM operator_channel_members WHERE channel_id = c.id) as member_count, c.created_at
		FROM operator_chat_channels c
		LEFT JOIN operator_channel_members m ON c.id = m.channel_id AND m.operator_id = $1
		WHERE c.is_archived = false AND (c.channel_type = 'public' OR m.operator_id IS NOT NULL)
	`
	args := []interface{}{operatorID}
	argNum := 2
	if channelType != "" && channelType != "all" {
		query += fmt.Sprintf(" AND c.channel_type = $%d", argNum)
		args = append(args, channelType)
	}
	query += " ORDER BY c.name"

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var channels []*ChatChannel
	for rows.Next() {
		c := &ChatChannel{}
		if err := rows.Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.ChannelType, &c.Department, &c.IsArchived, &c.IsReadonly, &c.MemberCount, &c.CreatedAt); err != nil {
			return nil, err
		}
		channels = append(channels, c)
	}
	return channels, nil
}

// CreateChatChannel crea un canal
func (r *OperatorRepository) CreateChatChannel(ctx context.Context, name, slug, channelType string, description, department *string, createdBy int64) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_chat_channels (name, slug, channel_type, description, department, created_by)
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
	`, name, slug, channelType, description, department, createdBy).Scan(&id)
	if err != nil {
		return 0, err
	}
	// Add creator as owner
	r.pool.Exec(ctx, `INSERT INTO operator_channel_members (channel_id, operator_id, role) VALUES ($1, $2, 'owner')`, id, createdBy)
	return id, nil
}

// JoinChatChannel une a un operador a un canal
func (r *OperatorRepository) JoinChatChannel(ctx context.Context, channelID, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO operator_channel_members (channel_id, operator_id) VALUES ($1, $2)
		ON CONFLICT (channel_id, operator_id) DO NOTHING
	`, channelID, operatorID)
	return err
}

// LeaveChatChannel remueve a un operador de un canal
func (r *OperatorRepository) LeaveChatChannel(ctx context.Context, channelID, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM operator_channel_members WHERE channel_id = $1 AND operator_id = $2`, channelID, operatorID)
	return err
}

// ChatMessage mensaje de chat
type ChatMessage struct {
	ID           int64      `json:"id"`
	ChannelID    int64      `json:"channel_id"`
	SenderID     int64      `json:"sender_id"`
	SenderName   string     `json:"sender_name"`
	MessageType  string     `json:"message_type"`
	Content      string     `json:"content"`
	ReplyToID    *int64     `json:"reply_to_id"`
	IsEdited     bool       `json:"is_edited"`
	IsPinned     bool       `json:"is_pinned"`
	CreatedAt    time.Time  `json:"created_at"`
}

// GetChannelMessages obtiene mensajes de un canal
func (r *OperatorRepository) GetChannelMessages(ctx context.Context, channelID int64, limit int, beforeID *int64) ([]*ChatMessage, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT m.id, m.channel_id, m.sender_id, COALESCE(o.first_name || ' ' || o.last_name, 'Sistema') as sender_name,
			m.message_type, m.content, m.reply_to_id, m.is_edited, m.is_pinned, m.created_at
		FROM operator_chat_messages m
		LEFT JOIN operators o ON m.sender_id = o.id
		WHERE m.channel_id = $1 AND m.is_deleted = false
	`
	args := []interface{}{channelID}
	argNum := 2
	if beforeID != nil {
		query += fmt.Sprintf(" AND m.id < $%d", argNum)
		args = append(args, *beforeID)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY m.created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*ChatMessage
	for rows.Next() {
		m := &ChatMessage{}
		if err := rows.Scan(&m.ID, &m.ChannelID, &m.SenderID, &m.SenderName, &m.MessageType, &m.Content, &m.ReplyToID, &m.IsEdited, &m.IsPinned, &m.CreatedAt); err != nil {
			return nil, err
		}
		messages = append(messages, m)
	}
	return messages, nil
}

// SendChannelMessage envía un mensaje a un canal
func (r *OperatorRepository) SendChannelMessage(ctx context.Context, channelID, senderID int64, messageType, content string, replyToID *int64) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_chat_messages (channel_id, sender_id, message_type, content, reply_to_id)
		VALUES ($1, $2, $3, $4, $5) RETURNING id
	`, channelID, senderID, messageType, content, replyToID).Scan(&id)
	return id, err
}

// EditChannelMessage edita un mensaje
func (r *OperatorRepository) EditChannelMessage(ctx context.Context, messageID, senderID int64, content string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_chat_messages SET content = $1, is_edited = true, edited_at = NOW()
		WHERE id = $2 AND sender_id = $3 AND is_deleted = false
	`, content, messageID, senderID)
	return err
}

// DeleteChannelMessage elimina un mensaje
func (r *OperatorRepository) DeleteChannelMessage(ctx context.Context, messageID, senderID int64) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_chat_messages SET is_deleted = true, deleted_at = NOW()
		WHERE id = $1 AND sender_id = $2
	`, messageID, senderID)
	return err
}

// PinChannelMessage fija un mensaje
func (r *OperatorRepository) PinChannelMessage(ctx context.Context, messageID, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_chat_messages SET is_pinned = NOT is_pinned, pinned_by = $1, pinned_at = NOW()
		WHERE id = $2
	`, operatorID, messageID)
	return err
}

// DirectMessage mensaje directo
type DirectMessage struct {
	ID          int64     `json:"id"`
	SenderID    int64     `json:"sender_id"`
	SenderName  string    `json:"sender_name"`
	RecipientID int64     `json:"recipient_id"`
	RecipientName string  `json:"recipient_name"`
	Content     string    `json:"content"`
	IsRead      bool      `json:"is_read"`
	ReadAt      *time.Time `json:"read_at"`
	CreatedAt   time.Time `json:"created_at"`
}

// GetDirectMessages obtiene mensajes directos entre dos operadores
func (r *OperatorRepository) GetDirectMessages(ctx context.Context, operatorID, otherOperatorID int64, limit int) ([]*DirectMessage, error) {
	if limit <= 0 {
		limit = 50
	}
	rows, err := r.pool.Query(ctx, `
		SELECT dm.id, dm.sender_id, COALESCE(s.first_name || ' ' || s.last_name, 'Sistema') as sender_name,
			dm.recipient_id, COALESCE(r.first_name || ' ' || r.last_name, 'Sistema') as recipient_name,
			dm.content, dm.is_read, dm.read_at, dm.created_at
		FROM operator_direct_messages dm
		LEFT JOIN operators s ON dm.sender_id = s.id
		LEFT JOIN operators r ON dm.recipient_id = r.id
		WHERE ((dm.sender_id = $1 AND dm.recipient_id = $2) OR (dm.sender_id = $2 AND dm.recipient_id = $1))
			AND ((dm.sender_id = $1 AND dm.is_deleted_by_sender = false) OR (dm.recipient_id = $1 AND dm.is_deleted_by_recipient = false))
		ORDER BY dm.created_at DESC LIMIT $3
	`, operatorID, otherOperatorID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*DirectMessage
	for rows.Next() {
		m := &DirectMessage{}
		if err := rows.Scan(&m.ID, &m.SenderID, &m.SenderName, &m.RecipientID, &m.RecipientName, &m.Content, &m.IsRead, &m.ReadAt, &m.CreatedAt); err != nil {
			return nil, err
		}
		messages = append(messages, m)
	}
	return messages, nil
}

// SendDirectMessage envía un mensaje directo
func (r *OperatorRepository) SendDirectMessage(ctx context.Context, senderID, recipientID int64, content string) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_direct_messages (sender_id, recipient_id, content)
		VALUES ($1, $2, $3) RETURNING id
	`, senderID, recipientID, content).Scan(&id)
	return id, err
}

// MarkDirectMessagesRead marca mensajes como leídos
func (r *OperatorRepository) MarkDirectMessagesRead(ctx context.Context, operatorID, senderID int64) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_direct_messages SET is_read = true, read_at = NOW()
		WHERE recipient_id = $1 AND sender_id = $2 AND is_read = false
	`, operatorID, senderID)
	return err
}

// GetUnreadDMCount obtiene conteo de mensajes directos no leídos
func (r *OperatorRepository) GetUnreadDMCount(ctx context.Context, operatorID int64) (int, error) {
	var count int
	err := r.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM operator_direct_messages WHERE recipient_id = $1 AND is_read = false AND is_deleted_by_recipient = false
	`, operatorID).Scan(&count)
	return count, err
}

// AddMessageReaction agrega una reacción a un mensaje
func (r *OperatorRepository) AddMessageReaction(ctx context.Context, messageID, operatorID int64, emoji string) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO operator_message_reactions (message_id, operator_id, emoji)
		VALUES ($1, $2, $3) ON CONFLICT (message_id, operator_id, emoji) DO NOTHING
	`, messageID, operatorID, emoji)
	return err
}

// RemoveMessageReaction remueve una reacción
func (r *OperatorRepository) RemoveMessageReaction(ctx context.Context, messageID, operatorID int64, emoji string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM operator_message_reactions WHERE message_id = $1 AND operator_id = $2 AND emoji = $3`, messageID, operatorID, emoji)
	return err
}


// ========== PART 6: ACTIVITY LOGS ==========

// OperatorActivityLog registro de actividad del operador
type OperatorActivityLog struct {
	ID           int64     `json:"id"`
	OperatorID   int64     `json:"operator_id"`
	OperatorName string    `json:"operator_name"`
	ActivityType string    `json:"activity_type"`
	Category     string    `json:"category"`
	Action       string    `json:"action"`
	Description  *string   `json:"description"`
	TargetType   *string   `json:"target_type"`
	TargetID     *int64    `json:"target_id"`
	IPAddress    *string   `json:"ip_address"`
	RiskLevel    string    `json:"risk_level"`
	IsSensitive  bool      `json:"is_sensitive"`
	CreatedAt    time.Time `json:"created_at"`
}

// GetActivityLogs obtiene logs de actividad
func (r *OperatorRepository) GetActivityLogs(ctx context.Context, operatorID int64, category, activityType string, limit int) ([]*OperatorActivityLog, error) {
	if limit <= 0 {
		limit = 100
	}
	query := `
		SELECT al.id, al.operator_id, COALESCE(o.first_name || ' ' || o.last_name, 'Sistema') as operator_name,
			al.activity_type, al.category, al.action, al.description, al.target_type, al.target_id,
			al.ip_address, al.risk_level, al.is_sensitive, al.created_at
		FROM operator_activity_logs al
		LEFT JOIN operators o ON al.operator_id = o.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if operatorID > 0 {
		query += fmt.Sprintf(" AND al.operator_id = $%d", argNum)
		args = append(args, operatorID)
		argNum++
	}
	if category != "" && category != "all" {
		query += fmt.Sprintf(" AND al.category = $%d", argNum)
		args = append(args, category)
		argNum++
	}
	if activityType != "" && activityType != "all" {
		query += fmt.Sprintf(" AND al.activity_type = $%d", argNum)
		args = append(args, activityType)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY al.created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []*OperatorActivityLog
	for rows.Next() {
		l := &OperatorActivityLog{}
		if err := rows.Scan(&l.ID, &l.OperatorID, &l.OperatorName, &l.ActivityType, &l.Category, &l.Action,
			&l.Description, &l.TargetType, &l.TargetID, &l.IPAddress, &l.RiskLevel, &l.IsSensitive, &l.CreatedAt); err != nil {
			return nil, err
		}
		logs = append(logs, l)
	}
	return logs, nil
}

// LogActivity registra una actividad
func (r *OperatorRepository) LogActivity(ctx context.Context, operatorID int64, activityType, category, action string, description *string, targetType *string, targetID *int64, ipAddress *string, riskLevel string, isSensitive bool) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO operator_activity_logs (operator_id, activity_type, category, action, description, target_type, target_id, ip_address, risk_level, is_sensitive)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`, operatorID, activityType, category, action, description, targetType, targetID, ipAddress, riskLevel, isSensitive)
	return err
}

// GetMyActivityLogs obtiene logs del operador actual
func (r *OperatorRepository) GetMyActivityLogs(ctx context.Context, operatorID int64, limit int) ([]*OperatorActivityLog, error) {
	return r.GetActivityLogs(ctx, operatorID, "", "", limit)
}

// AuditTrailEntry entrada de auditoría
type AuditTrailEntry struct {
	ID          int64     `json:"id"`
	OperatorID  int64     `json:"operator_id"`
	OperatorName string   `json:"operator_name"`
	AuditType   string    `json:"audit_type"`
	EntityType  string    `json:"entity_type"`
	EntityID    int64     `json:"entity_id"`
	Action      string    `json:"action"`
	OldData     *string   `json:"old_data"`
	NewData     *string   `json:"new_data"`
	Reason      *string   `json:"reason"`
	IPAddress   *string   `json:"ip_address"`
	CreatedAt   time.Time `json:"created_at"`
}

// GetAuditTrail obtiene trail de auditoría
func (r *OperatorRepository) GetAuditTrail(ctx context.Context, entityType string, entityID int64, limit int) ([]*AuditTrailEntry, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT at.id, at.operator_id, COALESCE(o.first_name || ' ' || o.last_name, 'Sistema') as operator_name,
			at.audit_type, at.entity_type, at.entity_id, at.action, at.old_data::text, at.new_data::text,
			at.reason, at.ip_address, at.created_at
		FROM operator_audit_trail at
		LEFT JOIN operators o ON at.operator_id = o.id
		WHERE 1=1
	`
	args := []interface{}{}
	argNum := 1
	if entityType != "" {
		query += fmt.Sprintf(" AND at.entity_type = $%d", argNum)
		args = append(args, entityType)
		argNum++
	}
	if entityID > 0 {
		query += fmt.Sprintf(" AND at.entity_id = $%d", argNum)
		args = append(args, entityID)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY at.created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []*AuditTrailEntry
	for rows.Next() {
		e := &AuditTrailEntry{}
		if err := rows.Scan(&e.ID, &e.OperatorID, &e.OperatorName, &e.AuditType, &e.EntityType, &e.EntityID,
			&e.Action, &e.OldData, &e.NewData, &e.Reason, &e.IPAddress, &e.CreatedAt); err != nil {
			return nil, err
		}
		entries = append(entries, e)
	}
	return entries, nil
}

// LoginAttempt intento de login
type LoginAttempt struct {
	ID            int64     `json:"id"`
	OperatorID    *int64    `json:"operator_id"`
	Email         *string   `json:"email"`
	Success       bool      `json:"success"`
	FailureReason *string   `json:"failure_reason"`
	IPAddress     string    `json:"ip_address"`
	Country       *string   `json:"location_country"`
	City          *string   `json:"location_city"`
	IsSuspicious  bool      `json:"is_suspicious"`
	CreatedAt     time.Time `json:"created_at"`
}

// GetLoginAttempts obtiene intentos de login
func (r *OperatorRepository) GetLoginAttempts(ctx context.Context, operatorID int64, successOnly *bool, limit int) ([]*LoginAttempt, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `SELECT id, operator_id, email, success, failure_reason, ip_address, location_country, location_city, is_suspicious, created_at FROM operator_login_attempts WHERE 1=1`
	args := []interface{}{}
	argNum := 1
	if operatorID > 0 {
		query += fmt.Sprintf(" AND operator_id = $%d", argNum)
		args = append(args, operatorID)
		argNum++
	}
	if successOnly != nil {
		query += fmt.Sprintf(" AND success = $%d", argNum)
		args = append(args, *successOnly)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var attempts []*LoginAttempt
	for rows.Next() {
		a := &LoginAttempt{}
		if err := rows.Scan(&a.ID, &a.OperatorID, &a.Email, &a.Success, &a.FailureReason, &a.IPAddress, &a.Country, &a.City, &a.IsSuspicious, &a.CreatedAt); err != nil {
			return nil, err
		}
		attempts = append(attempts, a)
	}
	return attempts, nil
}

// ========== REAL-TIME MONITORING ==========

// PlatformMetric métrica de plataforma
type PlatformMetric struct {
	ID               int64     `json:"id"`
	MetricType       string    `json:"metric_type"`
	MetricValue      float64   `json:"metric_value"`
	MetricUnit       *string   `json:"metric_unit"`
	ComparisonValue  *float64  `json:"comparison_value"`
	ChangePercentage *float64  `json:"change_percentage"`
	RecordedAt       time.Time `json:"recorded_at"`
}

// GetPlatformMetrics obtiene métricas de plataforma
func (r *OperatorRepository) GetPlatformMetrics(ctx context.Context, metricType string, limit int) ([]*PlatformMetric, error) {
	if limit <= 0 {
		limit = 100
	}
	query := `SELECT id, metric_type, metric_value, metric_unit, comparison_value, change_percentage, recorded_at FROM operator_platform_metrics WHERE 1=1`
	args := []interface{}{}
	argNum := 1
	if metricType != "" && metricType != "all" {
		query += fmt.Sprintf(" AND metric_type = $%d", argNum)
		args = append(args, metricType)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY recorded_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var metrics []*PlatformMetric
	for rows.Next() {
		m := &PlatformMetric{}
		if err := rows.Scan(&m.ID, &m.MetricType, &m.MetricValue, &m.MetricUnit, &m.ComparisonValue, &m.ChangePercentage, &m.RecordedAt); err != nil {
			return nil, err
		}
		metrics = append(metrics, m)
	}
	return metrics, nil
}

// GetLatestMetrics obtiene las métricas más recientes de cada tipo
func (r *OperatorRepository) GetLatestMetrics(ctx context.Context) ([]*PlatformMetric, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT DISTINCT ON (metric_type) id, metric_type, metric_value, metric_unit, comparison_value, change_percentage, recorded_at
		FROM operator_platform_metrics
		ORDER BY metric_type, recorded_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var metrics []*PlatformMetric
	for rows.Next() {
		m := &PlatformMetric{}
		if err := rows.Scan(&m.ID, &m.MetricType, &m.MetricValue, &m.MetricUnit, &m.ComparisonValue, &m.ChangePercentage, &m.RecordedAt); err != nil {
			return nil, err
		}
		metrics = append(metrics, m)
	}
	return metrics, nil
}

// ActiveUserMonitor usuario activo monitoreado
type ActiveUserMonitor struct {
	ID            int64     `json:"id"`
	UserID        int64     `json:"user_id"`
	UserEmail     *string   `json:"user_email"`
	UserName      *string   `json:"user_name"`
	SessionStart  time.Time `json:"session_start"`
	LastActivity  time.Time `json:"last_activity"`
	CurrentPage   *string   `json:"current_page"`
	IPAddress     *string   `json:"ip_address"`
	DeviceType    *string   `json:"device_type"`
	Country       *string   `json:"country"`
	IsTrading     bool      `json:"is_trading"`
	RiskScore     int       `json:"risk_score"`
	Flags         []string  `json:"flags"`
}

// GetActiveUsersMonitor obtiene usuarios activos
func (r *OperatorRepository) GetActiveUsersMonitor(ctx context.Context, isTrading *bool, minRiskScore int, limit int) ([]*ActiveUserMonitor, error) {
	if limit <= 0 {
		limit = 100
	}
	query := `
		SELECT id, user_id, user_email, user_name, session_start, last_activity, current_page,
			ip_address, device_type, country, is_trading, risk_score, COALESCE(flags, '{}') as flags
		FROM operator_active_users_monitor
		WHERE last_activity > NOW() - INTERVAL '15 minutes'
	`
	args := []interface{}{}
	argNum := 1
	if isTrading != nil {
		query += fmt.Sprintf(" AND is_trading = $%d", argNum)
		args = append(args, *isTrading)
		argNum++
	}
	if minRiskScore > 0 {
		query += fmt.Sprintf(" AND risk_score >= $%d", argNum)
		args = append(args, minRiskScore)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY risk_score DESC, last_activity DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*ActiveUserMonitor
	for rows.Next() {
		u := &ActiveUserMonitor{}
		if err := rows.Scan(&u.ID, &u.UserID, &u.UserEmail, &u.UserName, &u.SessionStart, &u.LastActivity,
			&u.CurrentPage, &u.IPAddress, &u.DeviceType, &u.Country, &u.IsTrading, &u.RiskScore, &u.Flags); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}

// ActiveTradeMonitor trade activo monitoreado
type ActiveTradeMonitor struct {
	ID                   int64     `json:"id"`
	TradeID              int64     `json:"trade_id"`
	UserID               int64     `json:"user_id"`
	UserName             *string   `json:"user_name"`
	Symbol               string    `json:"symbol"`
	Direction            string    `json:"direction"`
	Amount               float64   `json:"amount"`
	EntryPrice           *float64  `json:"entry_price"`
	CurrentPrice         *float64  `json:"current_price"`
	PotentialPayout      *float64  `json:"potential_payout"`
	ExpiresAt            time.Time `json:"expires_at"`
	TimeRemainingSeconds int       `json:"time_remaining_seconds"`
	IsDemo               bool      `json:"is_demo"`
	RiskFlags            []string  `json:"risk_flags"`
}

// GetActiveTradesMonitor obtiene trades activos
func (r *OperatorRepository) GetActiveTradesMonitor(ctx context.Context, symbol string, isDemo *bool, limit int) ([]*ActiveTradeMonitor, error) {
	if limit <= 0 {
		limit = 100
	}
	query := `
		SELECT id, trade_id, user_id, user_name, symbol, direction, amount, entry_price, current_price,
			potential_payout, expires_at, EXTRACT(EPOCH FROM (expires_at - NOW()))::int as time_remaining,
			is_demo, COALESCE(risk_flags, '{}') as risk_flags
		FROM operator_active_trades_monitor
		WHERE expires_at > NOW()
	`
	args := []interface{}{}
	argNum := 1
	if symbol != "" {
		query += fmt.Sprintf(" AND symbol = $%d", argNum)
		args = append(args, symbol)
		argNum++
	}
	if isDemo != nil {
		query += fmt.Sprintf(" AND is_demo = $%d", argNum)
		args = append(args, *isDemo)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY expires_at ASC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var trades []*ActiveTradeMonitor
	for rows.Next() {
		t := &ActiveTradeMonitor{}
		if err := rows.Scan(&t.ID, &t.TradeID, &t.UserID, &t.UserName, &t.Symbol, &t.Direction, &t.Amount,
			&t.EntryPrice, &t.CurrentPrice, &t.PotentialPayout, &t.ExpiresAt, &t.TimeRemainingSeconds,
			&t.IsDemo, &t.RiskFlags); err != nil {
			return nil, err
		}
		trades = append(trades, t)
	}
	return trades, nil
}

// SystemHealth salud del sistema
type SystemHealth struct {
	ID               int64      `json:"id"`
	Component        string     `json:"component"`
	Status           string     `json:"status"`
	ResponseTimeMs   *int       `json:"response_time_ms"`
	ErrorRate        *float64   `json:"error_rate"`
	LastError        *string    `json:"last_error"`
	LastErrorAt      *time.Time `json:"last_error_at"`
	UptimePercentage *float64   `json:"uptime_percentage"`
	CheckedAt        time.Time  `json:"checked_at"`
}

// GetSystemHealth obtiene estado de salud del sistema
func (r *OperatorRepository) GetSystemHealth(ctx context.Context) ([]*SystemHealth, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT DISTINCT ON (component) id, component, status, response_time_ms, error_rate, last_error, last_error_at, uptime_percentage, checked_at
		FROM operator_system_health
		ORDER BY component, checked_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var health []*SystemHealth
	for rows.Next() {
		h := &SystemHealth{}
		if err := rows.Scan(&h.ID, &h.Component, &h.Status, &h.ResponseTimeMs, &h.ErrorRate, &h.LastError, &h.LastErrorAt, &h.UptimePercentage, &h.CheckedAt); err != nil {
			return nil, err
		}
		health = append(health, h)
	}
	return health, nil
}

// RealtimeAlert alerta en tiempo real
type RealtimeAlert struct {
	ID             int64      `json:"id"`
	AlertType      string     `json:"alert_type"`
	Severity       string     `json:"severity"`
	Title          string     `json:"title"`
	Message        string     `json:"message"`
	Source         string     `json:"source"`
	IsBroadcast    bool       `json:"is_broadcast"`
	RequiresAction bool       `json:"requires_action"`
	ActionURL      *string    `json:"action_url"`
	ExpiresAt      *time.Time `json:"expires_at"`
	CreatedAt      time.Time  `json:"created_at"`
}

// GetRealtimeAlerts obtiene alertas en tiempo real
func (r *OperatorRepository) GetRealtimeAlerts(ctx context.Context, operatorID int64, limit int) ([]*RealtimeAlert, error) {
	if limit <= 0 {
		limit = 20
	}
	rows, err := r.pool.Query(ctx, `
		SELECT id, alert_type, severity, title, message, source, is_broadcast, requires_action, action_url, expires_at, created_at
		FROM operator_realtime_alerts
		WHERE (expires_at IS NULL OR expires_at > NOW())
			AND (is_broadcast = true OR $1 = ANY(target_operators))
		ORDER BY created_at DESC LIMIT $2
	`, operatorID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var alerts []*RealtimeAlert
	for rows.Next() {
		a := &RealtimeAlert{}
		if err := rows.Scan(&a.ID, &a.AlertType, &a.Severity, &a.Title, &a.Message, &a.Source, &a.IsBroadcast, &a.RequiresAction, &a.ActionURL, &a.ExpiresAt, &a.CreatedAt); err != nil {
			return nil, err
		}
		alerts = append(alerts, a)
	}
	return alerts, nil
}

// MonitoringThreshold umbral de monitoreo
type MonitoringThreshold struct {
	ID                 int64    `json:"id"`
	MetricName         string   `json:"metric_name"`
	WarningThreshold   *float64 `json:"warning_threshold"`
	CriticalThreshold  *float64 `json:"critical_threshold"`
	ComparisonOperator string   `json:"comparison_operator"`
	AlertOnBreach      bool     `json:"alert_on_breach"`
	CooldownMinutes    int      `json:"cooldown_minutes"`
	IsActive           bool     `json:"is_active"`
}

// GetMonitoringThresholds obtiene umbrales de monitoreo
func (r *OperatorRepository) GetMonitoringThresholds(ctx context.Context, activeOnly bool) ([]*MonitoringThreshold, error) {
	query := `SELECT id, metric_name, warning_threshold, critical_threshold, comparison_operator, alert_on_breach, cooldown_minutes, is_active FROM operator_monitoring_thresholds WHERE 1=1`
	if activeOnly {
		query += " AND is_active = true"
	}
	query += " ORDER BY metric_name"

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var thresholds []*MonitoringThreshold
	for rows.Next() {
		t := &MonitoringThreshold{}
		if err := rows.Scan(&t.ID, &t.MetricName, &t.WarningThreshold, &t.CriticalThreshold, &t.ComparisonOperator, &t.AlertOnBreach, &t.CooldownMinutes, &t.IsActive); err != nil {
			return nil, err
		}
		thresholds = append(thresholds, t)
	}
	return thresholds, nil
}

// CreateMonitoringThreshold crea un umbral
func (r *OperatorRepository) CreateMonitoringThreshold(ctx context.Context, metricName string, warningThreshold, criticalThreshold *float64, comparisonOperator string, alertOnBreach bool, cooldownMinutes int, createdBy int64) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_monitoring_thresholds (metric_name, warning_threshold, critical_threshold, comparison_operator, alert_on_breach, cooldown_minutes, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
	`, metricName, warningThreshold, criticalThreshold, comparisonOperator, alertOnBreach, cooldownMinutes, createdBy).Scan(&id)
	return id, err
}

// UpdateMonitoringThreshold actualiza un umbral
func (r *OperatorRepository) UpdateMonitoringThreshold(ctx context.Context, thresholdID int64, warningThreshold, criticalThreshold *float64, alertOnBreach bool, cooldownMinutes int, isActive bool) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_monitoring_thresholds SET warning_threshold = $1, critical_threshold = $2, alert_on_breach = $3, cooldown_minutes = $4, is_active = $5, updated_at = NOW()
		WHERE id = $6
	`, warningThreshold, criticalThreshold, alertOnBreach, cooldownMinutes, isActive, thresholdID)
	return err
}

// DeleteMonitoringThreshold elimina un umbral
func (r *OperatorRepository) DeleteMonitoringThreshold(ctx context.Context, thresholdID int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM operator_monitoring_thresholds WHERE id = $1`, thresholdID)
	return err
}

// MonitoringSummary resumen de monitoreo
type MonitoringSummary struct {
	ActiveUsers       int     `json:"active_users"`
	TradingUsers      int     `json:"trading_users"`
	ActiveTrades      int     `json:"active_trades"`
	TotalTradeVolume  float64 `json:"total_trade_volume"`
	PendingAlerts     int     `json:"pending_alerts"`
	SystemStatus      string  `json:"system_status"`
	AvgResponseTimeMs int     `json:"avg_response_time_ms"`
}

// GetMonitoringSummary obtiene resumen de monitoreo
func (r *OperatorRepository) GetMonitoringSummary(ctx context.Context) (*MonitoringSummary, error) {
	summary := &MonitoringSummary{SystemStatus: "healthy"}
	
	// Active users
	r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM operator_active_users_monitor WHERE last_activity > NOW() - INTERVAL '15 minutes'`).Scan(&summary.ActiveUsers)
	
	// Trading users
	r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM operator_active_users_monitor WHERE last_activity > NOW() - INTERVAL '15 minutes' AND is_trading = true`).Scan(&summary.TradingUsers)
	
	// Active trades
	r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM operator_active_trades_monitor WHERE expires_at > NOW()`).Scan(&summary.ActiveTrades)
	
	// Trade volume
	r.pool.QueryRow(ctx, `SELECT COALESCE(SUM(amount), 0) FROM operator_active_trades_monitor WHERE expires_at > NOW()`).Scan(&summary.TotalTradeVolume)
	
	// Pending alerts
	r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM operator_alerts WHERE status IN ('new', 'acknowledged')`).Scan(&summary.PendingAlerts)
	
	// System status
	var degradedCount int
	r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM (SELECT DISTINCT ON (component) status FROM operator_system_health ORDER BY component, checked_at DESC) s WHERE status != 'healthy'`).Scan(&degradedCount)
	if degradedCount > 0 {
		summary.SystemStatus = "degraded"
	}
	
	return summary, nil
}

// ========== PART 7: Reports ==========

// OperatorReport reporte generado
type OperatorReport struct {
	ID           int64      `json:"id"`
	ReportType   string     `json:"report_type"`
	ReportName   string     `json:"report_name"`
	Description  *string    `json:"description"`
	GeneratedBy  *int64     `json:"generated_by"`
	PeriodStart  *time.Time `json:"period_start"`
	PeriodEnd    *time.Time `json:"period_end"`
	Filters      string     `json:"filters"`
	Summary      string     `json:"summary"`
	FileURL      *string    `json:"file_url"`
	FileFormat   string     `json:"file_format"`
	FileSize     *int64     `json:"file_size"`
	Status       string     `json:"status"`
	ErrorMessage *string    `json:"error_message"`
	IsScheduled  bool       `json:"is_scheduled"`
	CreatedAt    time.Time  `json:"created_at"`
	CompletedAt  *time.Time `json:"completed_at"`
}

// GetReports obtiene reportes
func (r *OperatorRepository) GetReports(ctx context.Context, reportType, status string, limit int) ([]*OperatorReport, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `SELECT id, report_type, report_name, description, generated_by, period_start, period_end,
		COALESCE(filters::text, '{}'), COALESCE(summary::text, '{}'), file_url, file_format, file_size,
		status, error_message, is_scheduled, created_at, completed_at
		FROM operator_reports WHERE 1=1`
	args := []interface{}{}
	argNum := 1
	if reportType != "" && reportType != "all" {
		query += fmt.Sprintf(" AND report_type = $%d", argNum)
		args = append(args, reportType)
		argNum++
	}
	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND status = $%d", argNum)
		args = append(args, status)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reports []*OperatorReport
	for rows.Next() {
		rp := &OperatorReport{}
		if err := rows.Scan(&rp.ID, &rp.ReportType, &rp.ReportName, &rp.Description, &rp.GeneratedBy,
			&rp.PeriodStart, &rp.PeriodEnd, &rp.Filters, &rp.Summary, &rp.FileURL, &rp.FileFormat,
			&rp.FileSize, &rp.Status, &rp.ErrorMessage, &rp.IsScheduled, &rp.CreatedAt, &rp.CompletedAt); err != nil {
			return nil, err
		}
		reports = append(reports, rp)
	}
	return reports, nil
}

// CreateReport crea un nuevo reporte
func (r *OperatorRepository) CreateReport(ctx context.Context, reportType, reportName string, description *string, generatedBy int64, periodStart, periodEnd *time.Time, filters string, fileFormat string) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_reports (report_type, report_name, description, generated_by, period_start, period_end, filters, file_format, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, 'pending') RETURNING id
	`, reportType, reportName, description, generatedBy, periodStart, periodEnd, filters, fileFormat).Scan(&id)
	return id, err
}

// UpdateReportStatus actualiza estado del reporte
func (r *OperatorRepository) UpdateReportStatus(ctx context.Context, reportID int64, status string, summary, fileURL *string, fileSize *int64, errorMessage *string) error {
	query := `UPDATE operator_reports SET status = $1, updated_at = NOW()`
	args := []interface{}{status}
	argNum := 2
	if summary != nil {
		query += fmt.Sprintf(", summary = $%d::jsonb", argNum)
		args = append(args, *summary)
		argNum++
	}
	if fileURL != nil {
		query += fmt.Sprintf(", file_url = $%d", argNum)
		args = append(args, *fileURL)
		argNum++
	}
	if fileSize != nil {
		query += fmt.Sprintf(", file_size = $%d", argNum)
		args = append(args, *fileSize)
		argNum++
	}
	if errorMessage != nil {
		query += fmt.Sprintf(", error_message = $%d", argNum)
		args = append(args, *errorMessage)
		argNum++
	}
	if status == "completed" || status == "failed" {
		query += ", completed_at = NOW()"
	}
	query += fmt.Sprintf(" WHERE id = $%d", argNum)
	args = append(args, reportID)
	_, err := r.pool.Exec(ctx, query, args...)
	return err
}

// ReportTemplate plantilla de reporte
type ReportTemplate struct {
	ID             int64     `json:"id"`
	Name           string    `json:"name"`
	Slug           string    `json:"slug"`
	Description    *string   `json:"description"`
	ReportType     string    `json:"report_type"`
	DefaultFilters string    `json:"default_filters"`
	Columns        string    `json:"columns"`
	IsSystem       bool      `json:"is_system"`
	IsActive       bool      `json:"is_active"`
	CreatedAt      time.Time `json:"created_at"`
}

// GetReportTemplates obtiene plantillas de reportes
func (r *OperatorRepository) GetReportTemplates(ctx context.Context, reportType string, activeOnly bool) ([]*ReportTemplate, error) {
	query := `SELECT id, name, slug, description, report_type, COALESCE(default_filters::text, '{}'),
		COALESCE(columns::text, '[]'), is_system, is_active, created_at
		FROM operator_report_templates WHERE 1=1`
	args := []interface{}{}
	argNum := 1
	if reportType != "" && reportType != "all" {
		query += fmt.Sprintf(" AND report_type = $%d", argNum)
		args = append(args, reportType)
		argNum++
	}
	if activeOnly {
		query += " AND is_active = true"
	}
	query += " ORDER BY is_system DESC, name"

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var templates []*ReportTemplate
	for rows.Next() {
		t := &ReportTemplate{}
		if err := rows.Scan(&t.ID, &t.Name, &t.Slug, &t.Description, &t.ReportType, &t.DefaultFilters, &t.Columns, &t.IsSystem, &t.IsActive, &t.CreatedAt); err != nil {
			return nil, err
		}
		templates = append(templates, t)
	}
	return templates, nil
}

// DailySummary resumen diario
type DailySummary struct {
	ID                   int64     `json:"id"`
	SummaryDate          time.Time `json:"summary_date"`
	TotalUsers           int       `json:"total_users"`
	NewUsers             int       `json:"new_users"`
	ActiveUsers          int       `json:"active_users"`
	TotalTrades          int       `json:"total_trades"`
	TotalTradeVolume     float64   `json:"total_trade_volume"`
	WinningTrades        int       `json:"winning_trades"`
	LosingTrades         int       `json:"losing_trades"`
	PlatformProfit       float64   `json:"platform_profit"`
	TotalDeposits        float64   `json:"total_deposits"`
	TotalWithdrawals     float64   `json:"total_withdrawals"`
	DepositCount         int       `json:"deposit_count"`
	WithdrawalCount      int       `json:"withdrawal_count"`
	AlertsGenerated      int       `json:"alerts_generated"`
	AlertsResolved       int       `json:"alerts_resolved"`
	SupportTickets       int       `json:"support_tickets"`
	TournamentsActive    int       `json:"tournaments_active"`
	TournamentParticipants int     `json:"tournament_participants"`
	CreatedAt            time.Time `json:"created_at"`
}

// GetDailySummaries obtiene resúmenes diarios
func (r *OperatorRepository) GetDailySummaries(ctx context.Context, startDate, endDate *time.Time, limit int) ([]*DailySummary, error) {
	if limit <= 0 {
		limit = 30
	}
	query := `SELECT id, summary_date, total_users, new_users, active_users, total_trades, total_trade_volume,
		winning_trades, losing_trades, platform_profit, total_deposits, total_withdrawals, deposit_count,
		withdrawal_count, alerts_generated, alerts_resolved, support_tickets, tournaments_active,
		tournament_participants, created_at FROM operator_daily_summaries WHERE 1=1`
	args := []interface{}{}
	argNum := 1
	if startDate != nil {
		query += fmt.Sprintf(" AND summary_date >= $%d", argNum)
		args = append(args, *startDate)
		argNum++
	}
	if endDate != nil {
		query += fmt.Sprintf(" AND summary_date <= $%d", argNum)
		args = append(args, *endDate)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY summary_date DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var summaries []*DailySummary
	for rows.Next() {
		s := &DailySummary{}
		if err := rows.Scan(&s.ID, &s.SummaryDate, &s.TotalUsers, &s.NewUsers, &s.ActiveUsers, &s.TotalTrades,
			&s.TotalTradeVolume, &s.WinningTrades, &s.LosingTrades, &s.PlatformProfit, &s.TotalDeposits,
			&s.TotalWithdrawals, &s.DepositCount, &s.WithdrawalCount, &s.AlertsGenerated, &s.AlertsResolved,
			&s.SupportTickets, &s.TournamentsActive, &s.TournamentParticipants, &s.CreatedAt); err != nil {
			return nil, err
		}
		summaries = append(summaries, s)
	}
	return summaries, nil
}

// MonthlySummary resumen mensual
type MonthlySummary struct {
	ID               int64     `json:"id"`
	Year             int       `json:"year"`
	Month            int       `json:"month"`
	TotalUsers       int       `json:"total_users"`
	NewUsers         int       `json:"new_users"`
	ActiveUsers      int       `json:"active_users"`
	ChurnedUsers     int       `json:"churned_users"`
	TotalTrades      int       `json:"total_trades"`
	TotalTradeVolume float64   `json:"total_trade_volume"`
	PlatformProfit   float64   `json:"platform_profit"`
	TotalDeposits    float64   `json:"total_deposits"`
	TotalWithdrawals float64   `json:"total_withdrawals"`
	NetRevenue       float64   `json:"net_revenue"`
	AvgTradeSize     float64   `json:"avg_trade_size"`
	AvgTradesPerUser float64   `json:"avg_trades_per_user"`
	TopAssets        string    `json:"top_assets"`
	CreatedAt        time.Time `json:"created_at"`
}

// GetMonthlySummaries obtiene resúmenes mensuales
func (r *OperatorRepository) GetMonthlySummaries(ctx context.Context, year int, limit int) ([]*MonthlySummary, error) {
	if limit <= 0 {
		limit = 12
	}
	query := `SELECT id, year, month, total_users, new_users, active_users, churned_users, total_trades,
		total_trade_volume, platform_profit, total_deposits, total_withdrawals, net_revenue, avg_trade_size,
		avg_trades_per_user, COALESCE(top_assets::text, '[]'), created_at
		FROM operator_monthly_summaries WHERE 1=1`
	args := []interface{}{}
	argNum := 1
	if year > 0 {
		query += fmt.Sprintf(" AND year = $%d", argNum)
		args = append(args, year)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY year DESC, month DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var summaries []*MonthlySummary
	for rows.Next() {
		s := &MonthlySummary{}
		if err := rows.Scan(&s.ID, &s.Year, &s.Month, &s.TotalUsers, &s.NewUsers, &s.ActiveUsers, &s.ChurnedUsers,
			&s.TotalTrades, &s.TotalTradeVolume, &s.PlatformProfit, &s.TotalDeposits, &s.TotalWithdrawals,
			&s.NetRevenue, &s.AvgTradeSize, &s.AvgTradesPerUser, &s.TopAssets, &s.CreatedAt); err != nil {
			return nil, err
		}
		summaries = append(summaries, s)
	}
	return summaries, nil
}

// OperatorPerformanceMetric métricas de rendimiento del operador
type OperatorPerformanceMetric struct {
	ID                   int64      `json:"id"`
	OperatorID           int64      `json:"operator_id"`
	OperatorName         string     `json:"operator_name"`
	MetricDate           time.Time  `json:"metric_date"`
	ActionsCount         int        `json:"actions_count"`
	AlertsHandled        int        `json:"alerts_handled"`
	AlertsResolved       int        `json:"alerts_resolved"`
	AvgResponseTimeSecs  *int       `json:"avg_response_time_seconds"`
	TradesReviewed       int        `json:"trades_reviewed"`
	UsersManaged         int        `json:"users_managed"`
	EscalationsMade      int        `json:"escalations_made"`
	EscalationsReceived  int        `json:"escalations_received"`
	LoginCount           int        `json:"login_count"`
	ActiveHours          float64    `json:"active_hours"`
	QualityScore         *float64   `json:"quality_score"`
	EfficiencyScore      *float64   `json:"efficiency_score"`
}

// GetOperatorPerformanceMetrics obtiene métricas de rendimiento
func (r *OperatorRepository) GetOperatorPerformanceMetrics(ctx context.Context, operatorID int64, startDate, endDate *time.Time, limit int) ([]*OperatorPerformanceMetric, error) {
	if limit <= 0 {
		limit = 30
	}
	query := `SELECT pm.id, pm.operator_id, COALESCE(o.first_name || ' ' || o.last_name, 'Unknown') as operator_name,
		pm.metric_date, pm.actions_count, pm.alerts_handled, pm.alerts_resolved, pm.avg_response_time_seconds,
		pm.trades_reviewed, pm.users_managed, pm.escalations_made, pm.escalations_received, pm.login_count,
		pm.active_hours, pm.quality_score, pm.efficiency_score
		FROM operator_performance_metrics pm
		LEFT JOIN operators o ON pm.operator_id = o.id WHERE 1=1`
	args := []interface{}{}
	argNum := 1
	if operatorID > 0 {
		query += fmt.Sprintf(" AND pm.operator_id = $%d", argNum)
		args = append(args, operatorID)
		argNum++
	}
	if startDate != nil {
		query += fmt.Sprintf(" AND pm.metric_date >= $%d", argNum)
		args = append(args, *startDate)
		argNum++
	}
	if endDate != nil {
		query += fmt.Sprintf(" AND pm.metric_date <= $%d", argNum)
		args = append(args, *endDate)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY pm.metric_date DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var metrics []*OperatorPerformanceMetric
	for rows.Next() {
		m := &OperatorPerformanceMetric{}
		if err := rows.Scan(&m.ID, &m.OperatorID, &m.OperatorName, &m.MetricDate, &m.ActionsCount, &m.AlertsHandled,
			&m.AlertsResolved, &m.AvgResponseTimeSecs, &m.TradesReviewed, &m.UsersManaged, &m.EscalationsMade,
			&m.EscalationsReceived, &m.LoginCount, &m.ActiveHours, &m.QualityScore, &m.EfficiencyScore); err != nil {
			return nil, err
		}
		metrics = append(metrics, m)
	}
	return metrics, nil
}

// OperatorDataExport exportación de datos
type OperatorDataExport struct {
	ID           int64      `json:"id"`
	OperatorID   int64      `json:"operator_id"`
	ExportType   string     `json:"export_type"`
	ExportName   string     `json:"export_name"`
	Filters      string     `json:"filters"`
	FileFormat   string     `json:"file_format"`
	FileURL      *string    `json:"file_url"`
	FileSize     *int64     `json:"file_size"`
	RecordCount  *int       `json:"record_count"`
	Status       string     `json:"status"`
	ErrorMessage *string    `json:"error_message"`
	CreatedAt    time.Time  `json:"created_at"`
	CompletedAt  *time.Time `json:"completed_at"`
	ExpiresAt    *time.Time `json:"expires_at"`
}

// GetDataExports obtiene exportaciones de datos
func (r *OperatorRepository) GetDataExports(ctx context.Context, operatorID int64, exportType string, limit int) ([]*OperatorDataExport, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `SELECT id, operator_id, export_type, export_name, COALESCE(filters::text, '{}'), file_format,
		file_url, file_size, record_count, status, error_message, created_at, completed_at, expires_at
		FROM operator_data_exports WHERE operator_id = $1`
	args := []interface{}{operatorID}
	argNum := 2
	if exportType != "" && exportType != "all" {
		query += fmt.Sprintf(" AND export_type = $%d", argNum)
		args = append(args, exportType)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var exports []*OperatorDataExport
	for rows.Next() {
		e := &OperatorDataExport{}
		if err := rows.Scan(&e.ID, &e.OperatorID, &e.ExportType, &e.ExportName, &e.Filters, &e.FileFormat,
			&e.FileURL, &e.FileSize, &e.RecordCount, &e.Status, &e.ErrorMessage, &e.CreatedAt, &e.CompletedAt, &e.ExpiresAt); err != nil {
			return nil, err
		}
		exports = append(exports, e)
	}
	return exports, nil
}

// CreateDataExport crea una exportación de datos
func (r *OperatorRepository) CreateDataExport(ctx context.Context, operatorID int64, exportType, exportName, filters, fileFormat string) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_data_exports (operator_id, export_type, export_name, filters, file_format, status, expires_at)
		VALUES ($1, $2, $3, $4::jsonb, $5, 'pending', NOW() + INTERVAL '7 days') RETURNING id
	`, operatorID, exportType, exportName, filters, fileFormat).Scan(&id)
	return id, err
}

// CustomDashboard dashboard personalizado
type CustomDashboard struct {
	ID          int64     `json:"id"`
	OperatorID  int64     `json:"operator_id"`
	Name        string    `json:"name"`
	Description *string   `json:"description"`
	Layout      string    `json:"layout"`
	Widgets     string    `json:"widgets"`
	IsDefault   bool      `json:"is_default"`
	IsShared    bool      `json:"is_shared"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// GetCustomDashboards obtiene dashboards personalizados
func (r *OperatorRepository) GetCustomDashboards(ctx context.Context, operatorID int64) ([]*CustomDashboard, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, operator_id, name, description, COALESCE(layout::text, '{}'), COALESCE(widgets::text, '[]'),
			is_default, is_shared, created_at, updated_at
		FROM operator_custom_dashboards
		WHERE operator_id = $1 OR is_shared = true
		ORDER BY is_default DESC, name
	`, operatorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dashboards []*CustomDashboard
	for rows.Next() {
		d := &CustomDashboard{}
		if err := rows.Scan(&d.ID, &d.OperatorID, &d.Name, &d.Description, &d.Layout, &d.Widgets, &d.IsDefault, &d.IsShared, &d.CreatedAt, &d.UpdatedAt); err != nil {
			return nil, err
		}
		dashboards = append(dashboards, d)
	}
	return dashboards, nil
}

// CreateCustomDashboard crea un dashboard personalizado
func (r *OperatorRepository) CreateCustomDashboard(ctx context.Context, operatorID int64, name string, description *string, layout, widgets string, isDefault, isShared bool) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_custom_dashboards (operator_id, name, description, layout, widgets, is_default, is_shared)
		VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7) RETURNING id
	`, operatorID, name, description, layout, widgets, isDefault, isShared).Scan(&id)
	return id, err
}

// UpdateCustomDashboard actualiza un dashboard
func (r *OperatorRepository) UpdateCustomDashboard(ctx context.Context, dashboardID, operatorID int64, name string, description *string, layout, widgets string, isDefault, isShared bool) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_custom_dashboards SET name = $1, description = $2, layout = $3::jsonb, widgets = $4::jsonb,
			is_default = $5, is_shared = $6, updated_at = NOW()
		WHERE id = $7 AND operator_id = $8
	`, name, description, layout, widgets, isDefault, isShared, dashboardID, operatorID)
	return err
}

// DeleteCustomDashboard elimina un dashboard
func (r *OperatorRepository) DeleteCustomDashboard(ctx context.Context, dashboardID, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM operator_custom_dashboards WHERE id = $1 AND operator_id = $2`, dashboardID, operatorID)
	return err
}

// ========== PART 8: Security ==========

// OperatorSessionExtended sesión extendida del operador
type OperatorSessionExtended struct {
	ID               int64      `json:"id"`
	OperatorID       int64      `json:"operator_id"`
	SessionToken     string     `json:"-"`
	IPAddress        *string    `json:"ip_address"`
	UserAgent        *string    `json:"user_agent"`
	DeviceType       *string    `json:"device_type"`
	DeviceName       *string    `json:"device_name"`
	Browser          *string    `json:"browser"`
	OS               *string    `json:"os"`
	Location         *string    `json:"location"`
	Country          *string    `json:"country"`
	IsActive         bool       `json:"is_active"`
	IsCurrent        bool       `json:"is_current"`
	LastActivity     time.Time  `json:"last_activity"`
	CreatedAt        time.Time  `json:"created_at"`
	ExpiresAt        *time.Time `json:"expires_at"`
}

// GetOperatorSessionsExtended obtiene sesiones extendidas del operador
func (r *OperatorRepository) GetOperatorSessionsExtended(ctx context.Context, operatorID int64, activeOnly bool) ([]*OperatorSessionExtended, error) {
	query := `SELECT id, operator_id, ip_address, user_agent, device_type, device_name, browser, os,
		location, country, is_active, is_current, last_activity, created_at, expires_at
		FROM operator_sessions_extended WHERE operator_id = $1`
	if activeOnly {
		query += " AND is_active = true"
	}
	query += " ORDER BY last_activity DESC"

	rows, err := r.pool.Query(ctx, query, operatorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []*OperatorSessionExtended
	for rows.Next() {
		s := &OperatorSessionExtended{}
		if err := rows.Scan(&s.ID, &s.OperatorID, &s.IPAddress, &s.UserAgent, &s.DeviceType, &s.DeviceName,
			&s.Browser, &s.OS, &s.Location, &s.Country, &s.IsActive, &s.IsCurrent, &s.LastActivity,
			&s.CreatedAt, &s.ExpiresAt); err != nil {
			return nil, err
		}
		sessions = append(sessions, s)
	}
	return sessions, nil
}

// TerminateSessionExtended termina una sesión extendida
func (r *OperatorRepository) TerminateSessionExtended(ctx context.Context, sessionID, operatorID int64, reason string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_sessions_extended SET is_active = false, terminated_at = NOW(), terminated_reason = $1
		WHERE id = $2 AND operator_id = $3
	`, reason, sessionID, operatorID)
	return err
}

// TerminateAllSessionsExtended termina todas las sesiones extendidas excepto la actual
func (r *OperatorRepository) TerminateAllSessionsExtended(ctx context.Context, operatorID int64, exceptSessionID *int64) error {
	query := `UPDATE operator_sessions_extended SET is_active = false, terminated_at = NOW(), terminated_reason = 'Terminada por usuario'
		WHERE operator_id = $1 AND is_active = true`
	args := []interface{}{operatorID}
	if exceptSessionID != nil {
		query += " AND id != $2"
		args = append(args, *exceptSessionID)
	}
	_, err := r.pool.Exec(ctx, query, args...)
	return err
}

// OperatorLoginHistory historial de login
type OperatorLoginHistory struct {
	ID            int64     `json:"id"`
	OperatorID    *int64    `json:"operator_id"`
	Email         *string   `json:"email"`
	IPAddress     *string   `json:"ip_address"`
	DeviceType    *string   `json:"device_type"`
	Browser       *string   `json:"browser"`
	OS            *string   `json:"os"`
	Location      *string   `json:"location"`
	Country       *string   `json:"country"`
	Success       bool      `json:"success"`
	FailureReason *string   `json:"failure_reason"`
	RiskScore     int       `json:"risk_score"`
	IsSuspicious  bool      `json:"is_suspicious"`
	CreatedAt     time.Time `json:"created_at"`
}

// GetOperatorLoginHistory obtiene historial de login
func (r *OperatorRepository) GetOperatorLoginHistory(ctx context.Context, operatorID int64, successOnly *bool, limit int) ([]*OperatorLoginHistory, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `SELECT id, operator_id, email, ip_address, device_type, browser, os, location, country,
		success, failure_reason, risk_score, is_suspicious, created_at
		FROM operator_login_history WHERE 1=1`
	args := []interface{}{}
	argNum := 1
	if operatorID > 0 {
		query += fmt.Sprintf(" AND operator_id = $%d", argNum)
		args = append(args, operatorID)
		argNum++
	}
	if successOnly != nil {
		query += fmt.Sprintf(" AND success = $%d", argNum)
		args = append(args, *successOnly)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []*OperatorLoginHistory
	for rows.Next() {
		h := &OperatorLoginHistory{}
		if err := rows.Scan(&h.ID, &h.OperatorID, &h.Email, &h.IPAddress, &h.DeviceType, &h.Browser, &h.OS,
			&h.Location, &h.Country, &h.Success, &h.FailureReason, &h.RiskScore, &h.IsSuspicious, &h.CreatedAt); err != nil {
			return nil, err
		}
		history = append(history, h)
	}
	return history, nil
}

// OperatorAPIToken token de API
type OperatorAPIToken struct {
	ID          int64      `json:"id"`
	OperatorID  int64      `json:"operator_id"`
	Name        string     `json:"name"`
	TokenPrefix string     `json:"token_prefix"`
	Permissions string     `json:"permissions"`
	Scopes      string     `json:"scopes"`
	RateLimit   int        `json:"rate_limit"`
	IsActive    bool       `json:"is_active"`
	LastUsedAt  *time.Time `json:"last_used_at"`
	LastUsedIP  *string    `json:"last_used_ip"`
	UsageCount  int        `json:"usage_count"`
	ExpiresAt   *time.Time `json:"expires_at"`
	CreatedAt   time.Time  `json:"created_at"`
}

// GetAPITokens obtiene tokens de API del operador
func (r *OperatorRepository) GetAPITokens(ctx context.Context, operatorID int64) ([]*OperatorAPIToken, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, operator_id, name, token_prefix, COALESCE(permissions::text, '[]'), COALESCE(scopes::text, '[]'),
			rate_limit, is_active, last_used_at, last_used_ip, usage_count, expires_at, created_at
		FROM operator_api_tokens WHERE operator_id = $1 AND revoked_at IS NULL
		ORDER BY created_at DESC
	`, operatorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tokens []*OperatorAPIToken
	for rows.Next() {
		t := &OperatorAPIToken{}
		if err := rows.Scan(&t.ID, &t.OperatorID, &t.Name, &t.TokenPrefix, &t.Permissions, &t.Scopes,
			&t.RateLimit, &t.IsActive, &t.LastUsedAt, &t.LastUsedIP, &t.UsageCount, &t.ExpiresAt, &t.CreatedAt); err != nil {
			return nil, err
		}
		tokens = append(tokens, t)
	}
	return tokens, nil
}

// CreateAPIToken crea un token de API
func (r *OperatorRepository) CreateAPIToken(ctx context.Context, operatorID int64, name, tokenHash, tokenPrefix, permissions, scopes string, rateLimit int, expiresAt *time.Time) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_api_tokens (operator_id, name, token_hash, token_prefix, permissions, scopes, rate_limit, expires_at)
		VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8) RETURNING id
	`, operatorID, name, tokenHash, tokenPrefix, permissions, scopes, rateLimit, expiresAt).Scan(&id)
	return id, err
}

// RevokeAPIToken revoca un token de API
func (r *OperatorRepository) RevokeAPIToken(ctx context.Context, tokenID, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_api_tokens SET is_active = false, revoked_at = NOW()
		WHERE id = $1 AND operator_id = $2
	`, tokenID, operatorID)
	return err
}

// OperatorSecuritySettings configuración de seguridad
type OperatorSecuritySettings struct {
	ID                       int64      `json:"id"`
	OperatorID               int64      `json:"operator_id"`
	TwoFactorEnabled         bool       `json:"two_factor_enabled"`
	Require2FAForSensitive   bool       `json:"require_2fa_for_sensitive"`
	SessionTimeoutMinutes    int        `json:"session_timeout_minutes"`
	MaxSessions              int        `json:"max_sessions"`
	IPWhitelist              string     `json:"ip_whitelist"`
	LoginNotifications       bool       `json:"login_notifications"`
	SuspiciousActivityAlerts bool       `json:"suspicious_activity_alerts"`
	PasswordChangedAt        *time.Time `json:"password_changed_at"`
	ForcePasswordChange      bool       `json:"force_password_change"`
	UpdatedAt                time.Time  `json:"updated_at"`
}

// GetSecuritySettings obtiene configuración de seguridad
func (r *OperatorRepository) GetSecuritySettings(ctx context.Context, operatorID int64) (*OperatorSecuritySettings, error) {
	s := &OperatorSecuritySettings{}
	err := r.pool.QueryRow(ctx, `
		SELECT id, operator_id, two_factor_enabled, require_2fa_for_sensitive, session_timeout_minutes,
			max_sessions, COALESCE(ip_whitelist::text, '[]'), login_notifications, suspicious_activity_alerts,
			password_changed_at, force_password_change, updated_at
		FROM operator_security_settings WHERE operator_id = $1
	`, operatorID).Scan(&s.ID, &s.OperatorID, &s.TwoFactorEnabled, &s.Require2FAForSensitive,
		&s.SessionTimeoutMinutes, &s.MaxSessions, &s.IPWhitelist, &s.LoginNotifications,
		&s.SuspiciousActivityAlerts, &s.PasswordChangedAt, &s.ForcePasswordChange, &s.UpdatedAt)
	if err != nil {
		// Si no existe, crear con valores por defecto
		_, err = r.pool.Exec(ctx, `
			INSERT INTO operator_security_settings (operator_id) VALUES ($1) ON CONFLICT (operator_id) DO NOTHING
		`, operatorID)
		if err != nil {
			return nil, err
		}
		return r.GetSecuritySettings(ctx, operatorID)
	}
	return s, nil
}

// UpdateSecuritySettings actualiza configuración de seguridad
func (r *OperatorRepository) UpdateSecuritySettings(ctx context.Context, operatorID int64, require2FA bool, sessionTimeout, maxSessions int, ipWhitelist string, loginNotifications, suspiciousAlerts bool) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_security_settings SET require_2fa_for_sensitive = $1, session_timeout_minutes = $2,
			max_sessions = $3, ip_whitelist = $4::jsonb, login_notifications = $5, suspicious_activity_alerts = $6, updated_at = NOW()
		WHERE operator_id = $7
	`, require2FA, sessionTimeout, maxSessions, ipWhitelist, loginNotifications, suspiciousAlerts, operatorID)
	return err
}

// IPBlock bloqueo de IP
type IPBlock struct {
	ID             int64      `json:"id"`
	IPAddress      string     `json:"ip_address"`
	IPRange        *string    `json:"ip_range"`
	BlockType      string     `json:"block_type"`
	Reason         *string    `json:"reason"`
	BlockedBy      *int64     `json:"blocked_by"`
	FailedAttempts int        `json:"failed_attempts"`
	IsActive       bool       `json:"is_active"`
	ExpiresAt      *time.Time `json:"expires_at"`
	CreatedAt      time.Time  `json:"created_at"`
}

// GetIPBlocks obtiene bloqueos de IP
func (r *OperatorRepository) GetIPBlocks(ctx context.Context, activeOnly bool, limit int) ([]*IPBlock, error) {
	if limit <= 0 {
		limit = 100
	}
	query := `SELECT id, ip_address, ip_range, block_type, reason, blocked_by, failed_attempts, is_active, expires_at, created_at
		FROM operator_ip_blocks WHERE 1=1`
	if activeOnly {
		query += " AND is_active = true AND (expires_at IS NULL OR expires_at > NOW())"
	}
	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT %d", limit)

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var blocks []*IPBlock
	for rows.Next() {
		b := &IPBlock{}
		if err := rows.Scan(&b.ID, &b.IPAddress, &b.IPRange, &b.BlockType, &b.Reason, &b.BlockedBy,
			&b.FailedAttempts, &b.IsActive, &b.ExpiresAt, &b.CreatedAt); err != nil {
			return nil, err
		}
		blocks = append(blocks, b)
	}
	return blocks, nil
}

// CreateIPBlock crea un bloqueo de IP
func (r *OperatorRepository) CreateIPBlock(ctx context.Context, ipAddress string, ipRange *string, blockType, reason string, blockedBy int64, expiresAt *time.Time) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_ip_blocks (ip_address, ip_range, block_type, reason, blocked_by, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
	`, ipAddress, ipRange, blockType, reason, blockedBy, expiresAt).Scan(&id)
	return id, err
}

// RemoveIPBlock remueve un bloqueo de IP
func (r *OperatorRepository) RemoveIPBlock(ctx context.Context, blockID int64) error {
	_, err := r.pool.Exec(ctx, `UPDATE operator_ip_blocks SET is_active = false WHERE id = $1`, blockID)
	return err
}

// SecurityEvent evento de seguridad
type SecurityEvent struct {
	ID              int64      `json:"id"`
	OperatorID      *int64     `json:"operator_id"`
	EventType       string     `json:"event_type"`
	Severity        string     `json:"severity"`
	Description     *string    `json:"description"`
	IPAddress       *string    `json:"ip_address"`
	Metadata        string     `json:"metadata"`
	IsResolved      bool       `json:"is_resolved"`
	ResolvedBy      *int64     `json:"resolved_by"`
	ResolvedAt      *time.Time `json:"resolved_at"`
	ResolutionNotes *string    `json:"resolution_notes"`
	CreatedAt       time.Time  `json:"created_at"`
}

// GetSecurityEvents obtiene eventos de seguridad
func (r *OperatorRepository) GetSecurityEvents(ctx context.Context, operatorID int64, eventType, severity string, unresolvedOnly bool, limit int) ([]*SecurityEvent, error) {
	if limit <= 0 {
		limit = 100
	}
	query := `SELECT id, operator_id, event_type, severity, description, ip_address, COALESCE(metadata::text, '{}'),
		is_resolved, resolved_by, resolved_at, resolution_notes, created_at
		FROM operator_security_events WHERE 1=1`
	args := []interface{}{}
	argNum := 1
	if operatorID > 0 {
		query += fmt.Sprintf(" AND operator_id = $%d", argNum)
		args = append(args, operatorID)
		argNum++
	}
	if eventType != "" && eventType != "all" {
		query += fmt.Sprintf(" AND event_type = $%d", argNum)
		args = append(args, eventType)
		argNum++
	}
	if severity != "" && severity != "all" {
		query += fmt.Sprintf(" AND severity = $%d", argNum)
		args = append(args, severity)
		argNum++
	}
	if unresolvedOnly {
		query += " AND is_resolved = false"
	}
	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []*SecurityEvent
	for rows.Next() {
		e := &SecurityEvent{}
		if err := rows.Scan(&e.ID, &e.OperatorID, &e.EventType, &e.Severity, &e.Description, &e.IPAddress,
			&e.Metadata, &e.IsResolved, &e.ResolvedBy, &e.ResolvedAt, &e.ResolutionNotes, &e.CreatedAt); err != nil {
			return nil, err
		}
		events = append(events, e)
	}
	return events, nil
}

// ResolveSecurityEvent resuelve un evento de seguridad
func (r *OperatorRepository) ResolveSecurityEvent(ctx context.Context, eventID, resolvedBy int64, notes string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_security_events SET is_resolved = true, resolved_by = $1, resolved_at = NOW(), resolution_notes = $2
		WHERE id = $3
	`, resolvedBy, notes, eventID)
	return err
}

// TrustedDevice dispositivo confiable
type TrustedDevice struct {
	ID           int64      `json:"id"`
	OperatorID   int64      `json:"operator_id"`
	DeviceID     string     `json:"device_id"`
	DeviceName   *string    `json:"device_name"`
	DeviceType   *string    `json:"device_type"`
	Browser      *string    `json:"browser"`
	OS           *string    `json:"os"`
	IsTrusted    bool       `json:"is_trusted"`
	TrustExpires *time.Time `json:"trust_expires_at"`
	LastUsedAt   *time.Time `json:"last_used_at"`
	CreatedAt    time.Time  `json:"created_at"`
}

// GetTrustedDevices obtiene dispositivos confiables
func (r *OperatorRepository) GetTrustedDevices(ctx context.Context, operatorID int64) ([]*TrustedDevice, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, operator_id, device_id, device_name, device_type, browser, os, is_trusted, trust_expires_at, last_used_at, created_at
		FROM operator_trusted_devices WHERE operator_id = $1 ORDER BY last_used_at DESC NULLS LAST
	`, operatorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var devices []*TrustedDevice
	for rows.Next() {
		d := &TrustedDevice{}
		if err := rows.Scan(&d.ID, &d.OperatorID, &d.DeviceID, &d.DeviceName, &d.DeviceType, &d.Browser, &d.OS,
			&d.IsTrusted, &d.TrustExpires, &d.LastUsedAt, &d.CreatedAt); err != nil {
			return nil, err
		}
		devices = append(devices, d)
	}
	return devices, nil
}

// RemoveTrustedDevice remueve un dispositivo confiable
func (r *OperatorRepository) RemoveTrustedDevice(ctx context.Context, deviceID, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM operator_trusted_devices WHERE id = $1 AND operator_id = $2`, deviceID, operatorID)
	return err
}

// PasswordPolicy política de contraseña
type PasswordPolicy struct {
	ID                     int64 `json:"id"`
	Name                   string `json:"name"`
	MinLength              int    `json:"min_length"`
	RequireUppercase       bool   `json:"require_uppercase"`
	RequireLowercase       bool   `json:"require_lowercase"`
	RequireNumbers         bool   `json:"require_numbers"`
	RequireSpecial         bool   `json:"require_special"`
	MaxAgeDays             int    `json:"max_age_days"`
	HistoryCount           int    `json:"history_count"`
	LockoutAttempts        int    `json:"lockout_attempts"`
	LockoutDurationMinutes int    `json:"lockout_duration_minutes"`
	IsDefault              bool   `json:"is_default"`
	IsActive               bool   `json:"is_active"`
}

// GetPasswordPolicies obtiene políticas de contraseña
func (r *OperatorRepository) GetPasswordPolicies(ctx context.Context) ([]*PasswordPolicy, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, name, min_length, require_uppercase, require_lowercase, require_numbers, require_special,
			max_age_days, history_count, lockout_attempts, lockout_duration_minutes, is_default, is_active
		FROM operator_password_policies WHERE is_active = true ORDER BY is_default DESC, name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var policies []*PasswordPolicy
	for rows.Next() {
		p := &PasswordPolicy{}
		if err := rows.Scan(&p.ID, &p.Name, &p.MinLength, &p.RequireUppercase, &p.RequireLowercase, &p.RequireNumbers,
			&p.RequireSpecial, &p.MaxAgeDays, &p.HistoryCount, &p.LockoutAttempts, &p.LockoutDurationMinutes,
			&p.IsDefault, &p.IsActive); err != nil {
			return nil, err
		}
		policies = append(policies, p)
	}
	return policies, nil
}


// ========== PART 9: Notifications & Statistics ==========

// OperatorNotification notificación del operador
type OperatorNotification struct {
	ID               int64      `json:"id"`
	OperatorID       int64      `json:"operator_id"`
	NotificationType string     `json:"notification_type"`
	Category         string     `json:"category"`
	Title            string     `json:"title"`
	Message          string     `json:"message"`
	Priority         string     `json:"priority"`
	Icon             *string    `json:"icon"`
	ActionURL        *string    `json:"action_url"`
	ActionLabel      *string    `json:"action_label"`
	IsRead           bool       `json:"is_read"`
	ReadAt           *time.Time `json:"read_at"`
	IsArchived       bool       `json:"is_archived"`
	CreatedAt        time.Time  `json:"created_at"`
}

// GetOperatorNotifications obtiene notificaciones del operador
func (r *OperatorRepository) GetOperatorNotifications(ctx context.Context, operatorID int64, unreadOnly, includeArchived bool, limit int) ([]*OperatorNotification, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `SELECT id, operator_id, notification_type, category, title, message, priority, icon,
		action_url, action_label, is_read, read_at, is_archived, created_at
		FROM operator_notifications WHERE operator_id = $1`
	if unreadOnly {
		query += " AND is_read = false"
	}
	if !includeArchived {
		query += " AND is_archived = false"
	}
	query += " AND (expires_at IS NULL OR expires_at > NOW())"
	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT %d", limit)

	rows, err := r.pool.Query(ctx, query, operatorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []*OperatorNotification
	for rows.Next() {
		n := &OperatorNotification{}
		if err := rows.Scan(&n.ID, &n.OperatorID, &n.NotificationType, &n.Category, &n.Title, &n.Message,
			&n.Priority, &n.Icon, &n.ActionURL, &n.ActionLabel, &n.IsRead, &n.ReadAt, &n.IsArchived, &n.CreatedAt); err != nil {
			return nil, err
		}
		notifications = append(notifications, n)
	}
	return notifications, nil
}

// GetUnreadNotificationCount obtiene conteo de notificaciones no leídas
func (r *OperatorRepository) GetUnreadNotificationCount(ctx context.Context, operatorID int64) (int, error) {
	var count int
	err := r.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM operator_notifications
		WHERE operator_id = $1 AND is_read = false AND is_archived = false
		AND (expires_at IS NULL OR expires_at > NOW())
	`, operatorID).Scan(&count)
	return count, err
}

// MarkNotificationRead marca una notificación como leída
func (r *OperatorRepository) MarkNotificationRead(ctx context.Context, notificationID, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_notifications SET is_read = true, read_at = NOW()
		WHERE id = $1 AND operator_id = $2
	`, notificationID, operatorID)
	return err
}

// MarkAllNotificationsRead marca todas las notificaciones como leídas
func (r *OperatorRepository) MarkAllNotificationsRead(ctx context.Context, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_notifications SET is_read = true, read_at = NOW()
		WHERE operator_id = $1 AND is_read = false
	`, operatorID)
	return err
}

// ArchiveNotification archiva una notificación
func (r *OperatorRepository) ArchiveNotification(ctx context.Context, notificationID, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_notifications SET is_archived = true, archived_at = NOW()
		WHERE id = $1 AND operator_id = $2
	`, notificationID, operatorID)
	return err
}

// DeleteNotification elimina una notificación
func (r *OperatorRepository) DeleteNotification(ctx context.Context, notificationID, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM operator_notifications WHERE id = $1 AND operator_id = $2`, notificationID, operatorID)
	return err
}

// NotificationPreferences preferencias de notificación
type NotificationPreferences struct {
	ID                   int64   `json:"id"`
	OperatorID           int64   `json:"operator_id"`
	EmailEnabled         bool    `json:"email_enabled"`
	PushEnabled          bool    `json:"push_enabled"`
	SoundEnabled         bool    `json:"sound_enabled"`
	DesktopEnabled       bool    `json:"desktop_enabled"`
	AlertNotifications   bool    `json:"alert_notifications"`
	TradeNotifications   bool    `json:"trade_notifications"`
	UserNotifications    bool    `json:"user_notifications"`
	SystemNotifications  bool    `json:"system_notifications"`
	ChatNotifications    bool    `json:"chat_notifications"`
	ReportNotifications  bool    `json:"report_notifications"`
	QuietHoursEnabled    bool    `json:"quiet_hours_enabled"`
	QuietHoursStart      *string `json:"quiet_hours_start"`
	QuietHoursEnd        *string `json:"quiet_hours_end"`
	DigestEnabled        bool    `json:"digest_enabled"`
	DigestFrequency      string  `json:"digest_frequency"`
}

// GetNotificationPreferences obtiene preferencias de notificación
func (r *OperatorRepository) GetNotificationPreferences(ctx context.Context, operatorID int64) (*NotificationPreferences, error) {
	p := &NotificationPreferences{}
	err := r.pool.QueryRow(ctx, `
		SELECT id, operator_id, email_enabled, push_enabled, sound_enabled, desktop_enabled,
			alert_notifications, trade_notifications, user_notifications, system_notifications,
			chat_notifications, report_notifications, quiet_hours_enabled, quiet_hours_start::text,
			quiet_hours_end::text, digest_enabled, digest_frequency
		FROM operator_notification_preferences WHERE operator_id = $1
	`, operatorID).Scan(&p.ID, &p.OperatorID, &p.EmailEnabled, &p.PushEnabled, &p.SoundEnabled, &p.DesktopEnabled,
		&p.AlertNotifications, &p.TradeNotifications, &p.UserNotifications, &p.SystemNotifications,
		&p.ChatNotifications, &p.ReportNotifications, &p.QuietHoursEnabled, &p.QuietHoursStart,
		&p.QuietHoursEnd, &p.DigestEnabled, &p.DigestFrequency)
	if err != nil {
		// Crear preferencias por defecto si no existen
		_, err = r.pool.Exec(ctx, `INSERT INTO operator_notification_preferences (operator_id) VALUES ($1) ON CONFLICT DO NOTHING`, operatorID)
		if err != nil {
			return nil, err
		}
		return r.GetNotificationPreferences(ctx, operatorID)
	}
	return p, nil
}

// UpdateNotificationPreferences actualiza preferencias de notificación
func (r *OperatorRepository) UpdateNotificationPreferences(ctx context.Context, operatorID int64, emailEnabled, pushEnabled, soundEnabled, desktopEnabled, alertNotif, tradeNotif, userNotif, systemNotif, chatNotif, reportNotif, quietHours, digestEnabled bool, digestFrequency string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_notification_preferences SET email_enabled = $1, push_enabled = $2, sound_enabled = $3,
			desktop_enabled = $4, alert_notifications = $5, trade_notifications = $6, user_notifications = $7,
			system_notifications = $8, chat_notifications = $9, report_notifications = $10, quiet_hours_enabled = $11,
			digest_enabled = $12, digest_frequency = $13, updated_at = NOW()
		WHERE operator_id = $14
	`, emailEnabled, pushEnabled, soundEnabled, desktopEnabled, alertNotif, tradeNotif, userNotif, systemNotif, chatNotif, reportNotif, quietHours, digestEnabled, digestFrequency, operatorID)
	return err
}

// PlatformStats estadísticas de la plataforma
type PlatformStats struct {
	ID                     int64     `json:"id"`
	StatDate               time.Time `json:"stat_date"`
	StatHour               *int      `json:"stat_hour"`
	TotalUsers             int       `json:"total_users"`
	ActiveUsers            int       `json:"active_users"`
	NewUsers               int       `json:"new_users"`
	TotalTrades            int       `json:"total_trades"`
	ActiveTrades           int       `json:"active_trades"`
	CompletedTrades        int       `json:"completed_trades"`
	WinningTrades          int       `json:"winning_trades"`
	LosingTrades           int       `json:"losing_trades"`
	TotalVolume            float64   `json:"total_volume"`
	TotalDeposits          float64   `json:"total_deposits"`
	TotalWithdrawals       float64   `json:"total_withdrawals"`
	PlatformProfit         float64   `json:"platform_profit"`
	ActiveTournaments      int       `json:"active_tournaments"`
	TournamentParticipants int       `json:"tournament_participants"`
	OpenTickets            int       `json:"open_tickets"`
	ActiveAlerts           int       `json:"active_alerts"`
	CreatedAt              time.Time `json:"created_at"`
}

// GetPlatformStats obtiene estadísticas de la plataforma
func (r *OperatorRepository) GetPlatformStats(ctx context.Context, startDate, endDate *time.Time, limit int) ([]*PlatformStats, error) {
	if limit <= 0 {
		limit = 30
	}
	query := `SELECT id, stat_date, stat_hour, total_users, active_users, new_users, total_trades, active_trades,
		completed_trades, winning_trades, losing_trades, total_volume, total_deposits, total_withdrawals,
		platform_profit, active_tournaments, tournament_participants, open_tickets, active_alerts, created_at
		FROM operator_platform_stats WHERE 1=1`
	args := []interface{}{}
	argNum := 1
	if startDate != nil {
		query += fmt.Sprintf(" AND stat_date >= $%d", argNum)
		args = append(args, *startDate)
		argNum++
	}
	if endDate != nil {
		query += fmt.Sprintf(" AND stat_date <= $%d", argNum)
		args = append(args, *endDate)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY stat_date DESC, stat_hour DESC NULLS LAST LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stats []*PlatformStats
	for rows.Next() {
		s := &PlatformStats{}
		if err := rows.Scan(&s.ID, &s.StatDate, &s.StatHour, &s.TotalUsers, &s.ActiveUsers, &s.NewUsers,
			&s.TotalTrades, &s.ActiveTrades, &s.CompletedTrades, &s.WinningTrades, &s.LosingTrades,
			&s.TotalVolume, &s.TotalDeposits, &s.TotalWithdrawals, &s.PlatformProfit, &s.ActiveTournaments,
			&s.TournamentParticipants, &s.OpenTickets, &s.ActiveAlerts, &s.CreatedAt); err != nil {
			return nil, err
		}
		stats = append(stats, s)
	}
	return stats, nil
}

// KPI indicador clave de rendimiento
type KPI struct {
	ID               int64      `json:"id"`
	KPIName          string     `json:"kpi_name"`
	KPICategory      string     `json:"kpi_category"`
	CurrentValue     *float64   `json:"current_value"`
	PreviousValue    *float64   `json:"previous_value"`
	TargetValue      *float64   `json:"target_value"`
	Unit             *string    `json:"unit"`
	Trend            *string    `json:"trend"`
	ChangePercentage *float64   `json:"change_percentage"`
	PeriodType       string     `json:"period_type"`
	PeriodStart      *time.Time `json:"period_start"`
	PeriodEnd        *time.Time `json:"period_end"`
	IsPositiveGood   bool       `json:"is_positive_good"`
	CalculatedAt     time.Time  `json:"calculated_at"`
}

// GetKPIs obtiene KPIs
func (r *OperatorRepository) GetKPIs(ctx context.Context, category, periodType string) ([]*KPI, error) {
	query := `SELECT id, kpi_name, kpi_category, current_value, previous_value, target_value, unit, trend,
		change_percentage, period_type, period_start, period_end, is_positive_good, calculated_at
		FROM operator_kpis WHERE 1=1`
	args := []interface{}{}
	argNum := 1
	if category != "" && category != "all" {
		query += fmt.Sprintf(" AND kpi_category = $%d", argNum)
		args = append(args, category)
		argNum++
	}
	if periodType != "" && periodType != "all" {
		query += fmt.Sprintf(" AND period_type = $%d", argNum)
		args = append(args, periodType)
		argNum++
	}
	query += " ORDER BY kpi_category, kpi_name"

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var kpis []*KPI
	for rows.Next() {
		k := &KPI{}
		if err := rows.Scan(&k.ID, &k.KPIName, &k.KPICategory, &k.CurrentValue, &k.PreviousValue, &k.TargetValue,
			&k.Unit, &k.Trend, &k.ChangePercentage, &k.PeriodType, &k.PeriodStart, &k.PeriodEnd,
			&k.IsPositiveGood, &k.CalculatedAt); err != nil {
			return nil, err
		}
		kpis = append(kpis, k)
	}
	return kpis, nil
}

// AssetStats estadísticas por activo
type AssetStats struct {
	ID                 int64     `json:"id"`
	Symbol             string    `json:"symbol"`
	StatDate           time.Time `json:"stat_date"`
	TotalTrades        int       `json:"total_trades"`
	TotalVolume        float64   `json:"total_volume"`
	WinningTrades      int       `json:"winning_trades"`
	LosingTrades       int       `json:"losing_trades"`
	AvgTradeSize       float64   `json:"avg_trade_size"`
	AvgDurationSeconds int       `json:"avg_duration_seconds"`
	UniqueTraders      int       `json:"unique_traders"`
	PlatformProfit     float64   `json:"platform_profit"`
	PayoutPercentage   *float64  `json:"payout_percentage"`
	PopularityRank     *int      `json:"popularity_rank"`
}

// GetAssetStats obtiene estadísticas por activo
func (r *OperatorRepository) GetAssetStats(ctx context.Context, symbol string, startDate, endDate *time.Time, limit int) ([]*AssetStats, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `SELECT id, symbol, stat_date, total_trades, total_volume, winning_trades, losing_trades,
		avg_trade_size, avg_duration_seconds, unique_traders, platform_profit, payout_percentage, popularity_rank
		FROM operator_asset_stats WHERE 1=1`
	args := []interface{}{}
	argNum := 1
	if symbol != "" {
		query += fmt.Sprintf(" AND symbol = $%d", argNum)
		args = append(args, symbol)
		argNum++
	}
	if startDate != nil {
		query += fmt.Sprintf(" AND stat_date >= $%d", argNum)
		args = append(args, *startDate)
		argNum++
	}
	if endDate != nil {
		query += fmt.Sprintf(" AND stat_date <= $%d", argNum)
		args = append(args, *endDate)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY stat_date DESC, total_volume DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stats []*AssetStats
	for rows.Next() {
		s := &AssetStats{}
		if err := rows.Scan(&s.ID, &s.Symbol, &s.StatDate, &s.TotalTrades, &s.TotalVolume, &s.WinningTrades,
			&s.LosingTrades, &s.AvgTradeSize, &s.AvgDurationSeconds, &s.UniqueTraders, &s.PlatformProfit,
			&s.PayoutPercentage, &s.PopularityRank); err != nil {
			return nil, err
		}
		stats = append(stats, s)
	}
	return stats, nil
}

// TradingStatsAggregate estadísticas de trading agregadas
type TradingStatsAggregate struct {
	ID               int64     `json:"id"`
	StatDate         time.Time `json:"stat_date"`
	StatHour         *int      `json:"stat_hour"`
	TotalTrades      int       `json:"total_trades"`
	BuyTrades        int       `json:"buy_trades"`
	SellTrades       int       `json:"sell_trades"`
	TotalVolume      float64   `json:"total_volume"`
	AvgTradeSize     float64   `json:"avg_trade_size"`
	MaxTradeSize     float64   `json:"max_trade_size"`
	WinningTrades    int       `json:"winning_trades"`
	LosingTrades     int       `json:"losing_trades"`
	WinRate          *float64  `json:"win_rate"`
	TotalPayouts     float64   `json:"total_payouts"`
	PlatformProfit   float64   `json:"platform_profit"`
	MostTradedAsset  *string   `json:"most_traded_asset"`
	TradesByAsset    string    `json:"trades_by_asset"`
	TradesByDuration string    `json:"trades_by_duration"`
}

// GetTradingStatsAggregate obtiene estadísticas de trading agregadas
func (r *OperatorRepository) GetTradingStatsAggregate(ctx context.Context, startDate, endDate *time.Time, limit int) ([]*TradingStatsAggregate, error) {
	if limit <= 0 {
		limit = 30
	}
	query := `SELECT id, stat_date, stat_hour, total_trades, buy_trades, sell_trades, total_volume, avg_trade_size,
		max_trade_size, winning_trades, losing_trades, win_rate, total_payouts, platform_profit, most_traded_asset,
		COALESCE(trades_by_asset::text, '{}'), COALESCE(trades_by_duration::text, '{}')
		FROM operator_trading_stats_aggregate WHERE 1=1`
	args := []interface{}{}
	argNum := 1
	if startDate != nil {
		query += fmt.Sprintf(" AND stat_date >= $%d", argNum)
		args = append(args, *startDate)
		argNum++
	}
	if endDate != nil {
		query += fmt.Sprintf(" AND stat_date <= $%d", argNum)
		args = append(args, *endDate)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY stat_date DESC, stat_hour DESC NULLS LAST LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stats []*TradingStatsAggregate
	for rows.Next() {
		s := &TradingStatsAggregate{}
		if err := rows.Scan(&s.ID, &s.StatDate, &s.StatHour, &s.TotalTrades, &s.BuyTrades, &s.SellTrades,
			&s.TotalVolume, &s.AvgTradeSize, &s.MaxTradeSize, &s.WinningTrades, &s.LosingTrades, &s.WinRate,
			&s.TotalPayouts, &s.PlatformProfit, &s.MostTradedAsset, &s.TradesByAsset, &s.TradesByDuration); err != nil {
			return nil, err
		}
		stats = append(stats, s)
	}
	return stats, nil
}

// FinancialStatsAggregate estadísticas financieras agregadas
type FinancialStatsAggregate struct {
	ID                    int64     `json:"id"`
	StatDate              time.Time `json:"stat_date"`
	TotalDeposits         float64   `json:"total_deposits"`
	DepositCount          int       `json:"deposit_count"`
	AvgDeposit            float64   `json:"avg_deposit"`
	TotalWithdrawals      float64   `json:"total_withdrawals"`
	WithdrawalCount       int       `json:"withdrawal_count"`
	AvgWithdrawal         float64   `json:"avg_withdrawal"`
	PendingWithdrawals    float64   `json:"pending_withdrawals"`
	NetDeposits           float64   `json:"net_deposits"`
	DepositsByMethod      string    `json:"deposits_by_method"`
	WithdrawalsByMethod   string    `json:"withdrawals_by_method"`
	GrossRevenue          float64   `json:"gross_revenue"`
	NetRevenue            float64   `json:"net_revenue"`
	BonusesIssued         float64   `json:"bonuses_issued"`
	CommissionsPaid       float64   `json:"commissions_paid"`
}

// GetFinancialStatsAggregate obtiene estadísticas financieras agregadas
func (r *OperatorRepository) GetFinancialStatsAggregate(ctx context.Context, startDate, endDate *time.Time, limit int) ([]*FinancialStatsAggregate, error) {
	if limit <= 0 {
		limit = 30
	}
	query := `SELECT id, stat_date, total_deposits, deposit_count, avg_deposit, total_withdrawals, withdrawal_count,
		avg_withdrawal, pending_withdrawals, net_deposits, COALESCE(deposits_by_method::text, '{}'),
		COALESCE(withdrawals_by_method::text, '{}'), gross_revenue, net_revenue, bonuses_issued, commissions_paid
		FROM operator_financial_stats_aggregate WHERE 1=1`
	args := []interface{}{}
	argNum := 1
	if startDate != nil {
		query += fmt.Sprintf(" AND stat_date >= $%d", argNum)
		args = append(args, *startDate)
		argNum++
	}
	if endDate != nil {
		query += fmt.Sprintf(" AND stat_date <= $%d", argNum)
		args = append(args, *endDate)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY stat_date DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stats []*FinancialStatsAggregate
	for rows.Next() {
		s := &FinancialStatsAggregate{}
		if err := rows.Scan(&s.ID, &s.StatDate, &s.TotalDeposits, &s.DepositCount, &s.AvgDeposit, &s.TotalWithdrawals,
			&s.WithdrawalCount, &s.AvgWithdrawal, &s.PendingWithdrawals, &s.NetDeposits, &s.DepositsByMethod,
			&s.WithdrawalsByMethod, &s.GrossRevenue, &s.NetRevenue, &s.BonusesIssued, &s.CommissionsPaid); err != nil {
			return nil, err
		}
		stats = append(stats, s)
	}
	return stats, nil
}


// ========== PART 10: Final Features ==========

// SearchHistory historial de búsqueda
type SearchHistory struct {
	ID                 int64     `json:"id"`
	OperatorID         int64     `json:"operator_id"`
	SearchQuery        string    `json:"search_query"`
	SearchType         string    `json:"search_type"`
	ResultsCount       int       `json:"results_count"`
	SelectedResultType *string   `json:"selected_result_type"`
	SelectedResultID   *int64    `json:"selected_result_id"`
	CreatedAt          time.Time `json:"created_at"`
}

// GetSearchHistory obtiene historial de búsqueda
func (r *OperatorRepository) GetSearchHistory(ctx context.Context, operatorID int64, searchType string, limit int) ([]*SearchHistory, error) {
	if limit <= 0 {
		limit = 20
	}
	query := `SELECT id, operator_id, search_query, search_type, results_count, selected_result_type, selected_result_id, created_at
		FROM operator_search_history WHERE operator_id = $1`
	args := []interface{}{operatorID}
	argNum := 2
	if searchType != "" && searchType != "all" {
		query += fmt.Sprintf(" AND search_type = $%d", argNum)
		args = append(args, searchType)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []*SearchHistory
	for rows.Next() {
		h := &SearchHistory{}
		if err := rows.Scan(&h.ID, &h.OperatorID, &h.SearchQuery, &h.SearchType, &h.ResultsCount, &h.SelectedResultType, &h.SelectedResultID, &h.CreatedAt); err != nil {
			return nil, err
		}
		history = append(history, h)
	}
	return history, nil
}

// SaveSearchHistory guarda una búsqueda en el historial
func (r *OperatorRepository) SaveSearchHistory(ctx context.Context, operatorID int64, searchQuery, searchType string, resultsCount int) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_search_history (operator_id, search_query, search_type, results_count)
		VALUES ($1, $2, $3, $4) RETURNING id
	`, operatorID, searchQuery, searchType, resultsCount).Scan(&id)
	return id, err
}

// ClearSearchHistory limpia el historial de búsqueda
func (r *OperatorRepository) ClearSearchHistory(ctx context.Context, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM operator_search_history WHERE operator_id = $1`, operatorID)
	return err
}

// QuickAccess acceso rápido
type QuickAccess struct {
	ID           int64     `json:"id"`
	OperatorID   int64     `json:"operator_id"`
	ItemType     string    `json:"item_type"`
	ItemID       *int64    `json:"item_id"`
	ItemName     string    `json:"item_name"`
	ItemURL      *string   `json:"item_url"`
	Icon         *string   `json:"icon"`
	Color        *string   `json:"color"`
	DisplayOrder int       `json:"display_order"`
	IsPinned     bool      `json:"is_pinned"`
	CreatedAt    time.Time `json:"created_at"`
}

// GetQuickAccess obtiene accesos rápidos
func (r *OperatorRepository) GetQuickAccess(ctx context.Context, operatorID int64) ([]*QuickAccess, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, operator_id, item_type, item_id, item_name, item_url, icon, color, display_order, is_pinned, created_at
		FROM operator_quick_access WHERE operator_id = $1
		ORDER BY is_pinned DESC, display_order, created_at DESC
	`, operatorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*QuickAccess
	for rows.Next() {
		q := &QuickAccess{}
		if err := rows.Scan(&q.ID, &q.OperatorID, &q.ItemType, &q.ItemID, &q.ItemName, &q.ItemURL, &q.Icon, &q.Color, &q.DisplayOrder, &q.IsPinned, &q.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, q)
	}
	return items, nil
}

// AddQuickAccess agrega un acceso rápido
func (r *OperatorRepository) AddQuickAccess(ctx context.Context, operatorID int64, itemType string, itemID *int64, itemName string, itemURL, icon, color *string, isPinned bool) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_quick_access (operator_id, item_type, item_id, item_name, item_url, icon, color, is_pinned)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (operator_id, item_type, item_id) DO UPDATE SET item_name = $4, item_url = $5, icon = $6, color = $7
		RETURNING id
	`, operatorID, itemType, itemID, itemName, itemURL, icon, color, isPinned).Scan(&id)
	return id, err
}

// RemoveQuickAccess remueve un acceso rápido
func (r *OperatorRepository) RemoveQuickAccess(ctx context.Context, quickAccessID, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM operator_quick_access WHERE id = $1 AND operator_id = $2`, quickAccessID, operatorID)
	return err
}

// ToggleQuickAccessPin alterna el pin de un acceso rápido
func (r *OperatorRepository) ToggleQuickAccessPin(ctx context.Context, quickAccessID, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `UPDATE operator_quick_access SET is_pinned = NOT is_pinned WHERE id = $1 AND operator_id = $2`, quickAccessID, operatorID)
	return err
}

// OperatorWebhook webhook del operador
type OperatorWebhook struct {
	ID               int64      `json:"id"`
	OperatorID       int64      `json:"operator_id"`
	Name             string     `json:"name"`
	URL              string     `json:"url"`
	Events           string     `json:"events"`
	IsActive         bool       `json:"is_active"`
	RetryCount       int        `json:"retry_count"`
	TimeoutSeconds   int        `json:"timeout_seconds"`
	LastTriggeredAt  *time.Time `json:"last_triggered_at"`
	LastStatus       *string    `json:"last_status"`
	LastResponseCode *int       `json:"last_response_code"`
	SuccessCount     int        `json:"success_count"`
	FailureCount     int        `json:"failure_count"`
	CreatedAt        time.Time  `json:"created_at"`
}

// GetWebhooks obtiene webhooks del operador
func (r *OperatorRepository) GetWebhooks(ctx context.Context, operatorID int64, activeOnly bool) ([]*OperatorWebhook, error) {
	query := `SELECT id, operator_id, name, url, COALESCE(events::text, '[]'), is_active, retry_count, timeout_seconds,
		last_triggered_at, last_status, last_response_code, success_count, failure_count, created_at
		FROM operator_webhooks WHERE operator_id = $1`
	if activeOnly {
		query += " AND is_active = true"
	}
	query += " ORDER BY created_at DESC"

	rows, err := r.pool.Query(ctx, query, operatorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var webhooks []*OperatorWebhook
	for rows.Next() {
		w := &OperatorWebhook{}
		if err := rows.Scan(&w.ID, &w.OperatorID, &w.Name, &w.URL, &w.Events, &w.IsActive, &w.RetryCount, &w.TimeoutSeconds,
			&w.LastTriggeredAt, &w.LastStatus, &w.LastResponseCode, &w.SuccessCount, &w.FailureCount, &w.CreatedAt); err != nil {
			return nil, err
		}
		webhooks = append(webhooks, w)
	}
	return webhooks, nil
}

// CreateWebhook crea un webhook
func (r *OperatorRepository) CreateWebhook(ctx context.Context, operatorID int64, name, url, secret, events string, retryCount, timeoutSeconds int) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_webhooks (operator_id, name, url, secret, events, retry_count, timeout_seconds)
		VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7) RETURNING id
	`, operatorID, name, url, secret, events, retryCount, timeoutSeconds).Scan(&id)
	return id, err
}

// UpdateWebhook actualiza un webhook
func (r *OperatorRepository) UpdateWebhook(ctx context.Context, webhookID, operatorID int64, name, url, events string, isActive bool, retryCount, timeoutSeconds int) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_webhooks SET name = $1, url = $2, events = $3::jsonb, is_active = $4, retry_count = $5, timeout_seconds = $6, updated_at = NOW()
		WHERE id = $7 AND operator_id = $8
	`, name, url, events, isActive, retryCount, timeoutSeconds, webhookID, operatorID)
	return err
}

// DeleteWebhook elimina un webhook
func (r *OperatorRepository) DeleteWebhook(ctx context.Context, webhookID, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM operator_webhooks WHERE id = $1 AND operator_id = $2`, webhookID, operatorID)
	return err
}

// QuickNote nota rápida
type QuickNote struct {
	ID         int64      `json:"id"`
	OperatorID int64      `json:"operator_id"`
	Title      *string    `json:"title"`
	Content    string     `json:"content"`
	Color      string     `json:"color"`
	IsPinned   bool       `json:"is_pinned"`
	ReminderAt *time.Time `json:"reminder_at"`
	Tags       string     `json:"tags"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

// GetQuickNotes obtiene notas rápidas
func (r *OperatorRepository) GetQuickNotes(ctx context.Context, operatorID int64) ([]*QuickNote, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, operator_id, title, content, color, is_pinned, reminder_at, COALESCE(tags::text, '[]'), created_at, updated_at
		FROM operator_quick_notes WHERE operator_id = $1
		ORDER BY is_pinned DESC, updated_at DESC
	`, operatorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notes []*QuickNote
	for rows.Next() {
		n := &QuickNote{}
		if err := rows.Scan(&n.ID, &n.OperatorID, &n.Title, &n.Content, &n.Color, &n.IsPinned, &n.ReminderAt, &n.Tags, &n.CreatedAt, &n.UpdatedAt); err != nil {
			return nil, err
		}
		notes = append(notes, n)
	}
	return notes, nil
}

// CreateQuickNote crea una nota rápida
func (r *OperatorRepository) CreateQuickNote(ctx context.Context, operatorID int64, title *string, content, color string, isPinned bool, reminderAt *time.Time, tags string) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_quick_notes (operator_id, title, content, color, is_pinned, reminder_at, tags)
		VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb) RETURNING id
	`, operatorID, title, content, color, isPinned, reminderAt, tags).Scan(&id)
	return id, err
}

// UpdateQuickNote actualiza una nota rápida
func (r *OperatorRepository) UpdateQuickNote(ctx context.Context, noteID, operatorID int64, title *string, content, color string, isPinned bool, reminderAt *time.Time, tags string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE operator_quick_notes SET title = $1, content = $2, color = $3, is_pinned = $4, reminder_at = $5, tags = $6::jsonb, updated_at = NOW()
		WHERE id = $7 AND operator_id = $8
	`, title, content, color, isPinned, reminderAt, tags, noteID, operatorID)
	return err
}

// DeleteQuickNote elimina una nota rápida
func (r *OperatorRepository) DeleteQuickNote(ctx context.Context, noteID, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM operator_quick_notes WHERE id = $1 AND operator_id = $2`, noteID, operatorID)
	return err
}

// OperatorTask tarea del operador
type OperatorTask struct {
	ID          int64      `json:"id"`
	OperatorID  int64      `json:"operator_id"`
	Title       string     `json:"title"`
	Description *string    `json:"description"`
	Priority    string     `json:"priority"`
	Status      string     `json:"status"`
	DueDate     *time.Time `json:"due_date"`
	CompletedAt *time.Time `json:"completed_at"`
	RelatedType *string    `json:"related_type"`
	RelatedID   *int64     `json:"related_id"`
	Tags        string     `json:"tags"`
	CreatedAt   time.Time  `json:"created_at"`
}

// GetOperatorTasks obtiene tareas del operador
func (r *OperatorRepository) GetOperatorTasks(ctx context.Context, operatorID int64, status, priority string, limit int) ([]*OperatorTask, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `SELECT id, operator_id, title, description, priority, status, due_date, completed_at, related_type, related_id, COALESCE(tags::text, '[]'), created_at
		FROM operator_tasks WHERE operator_id = $1`
	args := []interface{}{operatorID}
	argNum := 2
	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND status = $%d", argNum)
		args = append(args, status)
		argNum++
	}
	if priority != "" && priority != "all" {
		query += fmt.Sprintf(" AND priority = $%d", argNum)
		args = append(args, priority)
		argNum++
	}
	query += fmt.Sprintf(" ORDER BY CASE WHEN status = 'pending' THEN 0 ELSE 1 END, due_date NULLS LAST, created_at DESC LIMIT $%d", argNum)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []*OperatorTask
	for rows.Next() {
		t := &OperatorTask{}
		if err := rows.Scan(&t.ID, &t.OperatorID, &t.Title, &t.Description, &t.Priority, &t.Status, &t.DueDate, &t.CompletedAt, &t.RelatedType, &t.RelatedID, &t.Tags, &t.CreatedAt); err != nil {
			return nil, err
		}
		tasks = append(tasks, t)
	}
	return tasks, nil
}

// CreateOperatorTask crea una tarea
func (r *OperatorRepository) CreateOperatorTask(ctx context.Context, operatorID int64, title string, description *string, priority string, dueDate *time.Time, relatedType *string, relatedID *int64, tags string) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_tasks (operator_id, title, description, priority, due_date, related_type, related_id, tags)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb) RETURNING id
	`, operatorID, title, description, priority, dueDate, relatedType, relatedID, tags).Scan(&id)
	return id, err
}

// UpdateOperatorTaskStatus actualiza el estado de una tarea
func (r *OperatorRepository) UpdateOperatorTaskStatus(ctx context.Context, taskID, operatorID int64, status string) error {
	query := `UPDATE operator_tasks SET status = $1, updated_at = NOW()`
	if status == "completed" {
		query += ", completed_at = NOW()"
	}
	query += " WHERE id = $2 AND operator_id = $3"
	_, err := r.pool.Exec(ctx, query, status, taskID, operatorID)
	return err
}

// DeleteOperatorTask elimina una tarea
func (r *OperatorRepository) DeleteOperatorTask(ctx context.Context, taskID, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM operator_tasks WHERE id = $1 AND operator_id = $2`, taskID, operatorID)
	return err
}

// OperatorKeyboardShortcut atajo de teclado del operador
type OperatorKeyboardShortcut struct {
	ID         int64  `json:"id"`
	OperatorID int64  `json:"operator_id"`
	Action     string `json:"action"`
	Shortcut   string `json:"shortcut"`
	IsActive   bool   `json:"is_active"`
}

// GetKeyboardShortcuts obtiene atajos de teclado
func (r *OperatorRepository) GetKeyboardShortcuts(ctx context.Context, operatorID int64) ([]*OperatorKeyboardShortcut, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, operator_id, action, shortcut, is_active
		FROM operator_keyboard_shortcuts WHERE operator_id = $1
		ORDER BY action
	`, operatorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var shortcuts []*OperatorKeyboardShortcut
	for rows.Next() {
		s := &OperatorKeyboardShortcut{}
		if err := rows.Scan(&s.ID, &s.OperatorID, &s.Action, &s.Shortcut, &s.IsActive); err != nil {
			return nil, err
		}
		shortcuts = append(shortcuts, s)
	}
	return shortcuts, nil
}

// UpdateKeyboardShortcut actualiza un atajo de teclado
func (r *OperatorRepository) UpdateKeyboardShortcut(ctx context.Context, operatorID int64, action, shortcut string) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO operator_keyboard_shortcuts (operator_id, action, shortcut)
		VALUES ($1, $2, $3)
		ON CONFLICT (operator_id, action) DO UPDATE SET shortcut = $3
	`, operatorID, action, shortcut)
	return err
}

// OperatorQuickResponse respuesta rápida del operador
type OperatorQuickResponse struct {
	ID         int64     `json:"id"`
	OperatorID *int64    `json:"operator_id"`
	Name       string    `json:"name"`
	Shortcut   *string   `json:"shortcut"`
	Content    string    `json:"content"`
	Category   *string   `json:"category"`
	Variables  string    `json:"variables"`
	IsGlobal   bool      `json:"is_global"`
	UseCount   int       `json:"use_count"`
	CreatedAt  time.Time `json:"created_at"`
}

// GetQuickResponses obtiene respuestas rápidas
func (r *OperatorRepository) GetQuickResponses(ctx context.Context, operatorID int64, category string) ([]*OperatorQuickResponse, error) {
	query := `SELECT id, operator_id, name, shortcut, content, category, COALESCE(variables::text, '[]'), is_global, use_count, created_at
		FROM operator_quick_responses WHERE (operator_id = $1 OR is_global = true)`
	args := []interface{}{operatorID}
	argNum := 2
	if category != "" && category != "all" {
		query += fmt.Sprintf(" AND category = $%d", argNum)
		args = append(args, category)
	}
	query += " ORDER BY use_count DESC, name"

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var responses []*OperatorQuickResponse
	for rows.Next() {
		qr := &OperatorQuickResponse{}
		if err := rows.Scan(&qr.ID, &qr.OperatorID, &qr.Name, &qr.Shortcut, &qr.Content, &qr.Category, &qr.Variables, &qr.IsGlobal, &qr.UseCount, &qr.CreatedAt); err != nil {
			return nil, err
		}
		responses = append(responses, qr)
	}
	return responses, nil
}

// CreateQuickResponse crea una respuesta rápida
func (r *OperatorRepository) CreateQuickResponse(ctx context.Context, operatorID int64, name string, shortcut *string, content string, category *string, variables string, isGlobal bool) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `
		INSERT INTO operator_quick_responses (operator_id, name, shortcut, content, category, variables, is_global)
		VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7) RETURNING id
	`, operatorID, name, shortcut, content, category, variables, isGlobal).Scan(&id)
	return id, err
}

// DeleteQuickResponse elimina una respuesta rápida
func (r *OperatorRepository) DeleteQuickResponse(ctx context.Context, responseID, operatorID int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM operator_quick_responses WHERE id = $1 AND (operator_id = $2 OR (is_global = true AND $2 IN (SELECT id FROM operators WHERE role = 'admin')))`, responseID, operatorID)
	return err
}
