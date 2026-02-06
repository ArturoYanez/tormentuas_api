package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"tormentus/internal/repositories"

	"github.com/gin-gonic/gin"
)

// OperatorDBHandler maneja las peticiones del operador
type OperatorDBHandler struct {
	repo *repositories.OperatorRepository
}

// NewOperatorDBHandler crea un nuevo handler
func NewOperatorDBHandler(repo *repositories.OperatorRepository) *OperatorDBHandler {
	return &OperatorDBHandler{repo: repo}
}

// getOperatorID obtiene el ID del operador del contexto (basado en user_id)
func (h *OperatorDBHandler) getOperatorID(c *gin.Context) int64 {
	if userID, exists := c.Get("user_id"); exists {
		// Buscar operador por user_id
		op, err := h.repo.GetOperatorByUserID(c.Request.Context(), userID.(int64))
		if err == nil {
			return op.ID
		}
	}
	return 0
}

// getUserID obtiene el user_id del contexto
func (h *OperatorDBHandler) getUserID(c *gin.Context) int64 {
	if id, exists := c.Get("user_id"); exists {
		return id.(int64)
	}
	return 0
}

// ========== DASHBOARD ==========

// GetDashboardStats obtiene estadísticas del dashboard
func (h *OperatorDBHandler) GetDashboardStats(c *gin.Context) {
	stats, err := h.repo.GetDashboardStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estadísticas"})
		return
	}
	c.JSON(http.StatusOK, stats)
}

// ========== OPERATORS ==========

// GetOperators obtiene lista de operadores
func (h *OperatorDBHandler) GetOperators(c *gin.Context) {
	department := c.Query("department")
	status := c.Query("status")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	operators, err := h.repo.GetOperators(c.Request.Context(), department, status, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo operadores"})
		return
	}
	c.JSON(http.StatusOK, operators)
}

// GetOperatorByID obtiene un operador por ID
func (h *OperatorDBHandler) GetOperatorByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operator, err := h.repo.GetOperatorByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Operador no encontrado"})
		return
	}
	c.JSON(http.StatusOK, operator)
}

// GetMyProfile obtiene el perfil del operador actual
func (h *OperatorDBHandler) GetMyProfile(c *gin.Context) {
	userID := h.getUserID(c)
	operator, err := h.repo.GetOperatorByUserID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Operador no encontrado"})
		return
	}
	c.JSON(http.StatusOK, operator)
}

// UpdateOperatorStatus actualiza el estado del operador
func (h *OperatorDBHandler) UpdateOperatorStatus(c *gin.Context) {
	var req struct {
		Status        string `json:"status" binding:"required"`
		StatusMessage string `json:"status_message"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Estado requerido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if operatorID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Operador no encontrado"})
		return
	}

	if err := h.repo.UpdateOperatorStatus(c.Request.Context(), operatorID, req.Status, req.StatusMessage); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando estado"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Estado actualizado"})
}

// ========== SESSIONS ==========

// GetOperatorSessions obtiene sesiones del operador
func (h *OperatorDBHandler) GetOperatorSessions(c *gin.Context) {
	operatorID := h.getOperatorID(c)
	if operatorID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Operador no encontrado"})
		return
	}

	sessions, err := h.repo.GetOperatorSessions(c.Request.Context(), operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo sesiones"})
		return
	}
	c.JSON(http.StatusOK, sessions)
}

// InvalidateOperatorSession invalida una sesión
func (h *OperatorDBHandler) InvalidateOperatorSession(c *gin.Context) {
	sessionID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if operatorID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Operador no encontrado"})
		return
	}

	if err := h.repo.InvalidateOperatorSession(c.Request.Context(), sessionID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error invalidando sesión"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Sesión invalidada"})
}

// InvalidateAllOperatorSessions invalida todas las sesiones
func (h *OperatorDBHandler) InvalidateAllOperatorSessions(c *gin.Context) {
	operatorID := h.getOperatorID(c)
	if operatorID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Operador no encontrado"})
		return
	}

	var req struct {
		CurrentSessionID int64 `json:"current_session_id"`
	}
	c.ShouldBindJSON(&req)

	if err := h.repo.InvalidateAllOperatorSessions(c.Request.Context(), operatorID, req.CurrentSessionID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error invalidando sesiones"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Sesiones invalidadas"})
}

// ========== SETTINGS ==========

// GetOperatorSettings obtiene configuración del operador
func (h *OperatorDBHandler) GetOperatorSettings(c *gin.Context) {
	operatorID := h.getOperatorID(c)
	if operatorID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Operador no encontrado"})
		return
	}

	settings, err := h.repo.GetOperatorSettings(c.Request.Context(), operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo configuración"})
		return
	}
	c.JSON(http.StatusOK, settings)
}

// UpdateOperatorSettings actualiza configuración
func (h *OperatorDBHandler) UpdateOperatorSettings(c *gin.Context) {
	var req struct {
		Theme                string `json:"theme"`
		Language             string `json:"language"`
		Timezone             string `json:"timezone"`
		NotificationsEnabled bool   `json:"notifications_enabled"`
		AutoRefresh          bool   `json:"auto_refresh"`
		SoundAlerts          bool   `json:"sound_alerts"`
		EmailAlerts          bool   `json:"email_alerts"`
		FontSize             string `json:"font_size"`
		Density              string `json:"density"`
		DoNotDisturb         bool   `json:"do_not_disturb"`
		SessionTimeout       int    `json:"session_timeout"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	operatorID := h.getOperatorID(c)
	if operatorID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Operador no encontrado"})
		return
	}

	settings := &repositories.OperatorSettings{
		Theme:                req.Theme,
		Language:             req.Language,
		Timezone:             req.Timezone,
		NotificationsEnabled: req.NotificationsEnabled,
		AutoRefresh:          req.AutoRefresh,
		SoundAlerts:          req.SoundAlerts,
		EmailAlerts:          req.EmailAlerts,
		FontSize:             req.FontSize,
		Density:              req.Density,
		DoNotDisturb:         req.DoNotDisturb,
		SessionTimeout:       req.SessionTimeout,
	}

	if err := h.repo.UpdateOperatorSettings(c.Request.Context(), operatorID, settings); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando configuración"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Configuración actualizada"})
}

// ========== WORK SCHEDULE ==========

// GetOperatorWorkSchedule obtiene horario de trabajo
func (h *OperatorDBHandler) GetOperatorWorkSchedule(c *gin.Context) {
	operatorID := h.getOperatorID(c)
	if operatorID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Operador no encontrado"})
		return
	}

	schedule, err := h.repo.GetOperatorWorkSchedule(c.Request.Context(), operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo horario"})
		return
	}
	c.JSON(http.StatusOK, schedule)
}

// UpdateOperatorWorkSchedule actualiza horario de trabajo
func (h *OperatorDBHandler) UpdateOperatorWorkSchedule(c *gin.Context) {
	var req struct {
		DayOfWeek    int    `json:"day_of_week" binding:"required"`
		StartTime    string `json:"start_time" binding:"required"`
		EndTime      string `json:"end_time" binding:"required"`
		IsWorkingDay bool   `json:"is_working_day"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	operatorID := h.getOperatorID(c)
	if operatorID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Operador no encontrado"})
		return
	}

	if err := h.repo.UpdateOperatorWorkSchedule(c.Request.Context(), operatorID, req.DayOfWeek, req.StartTime, req.EndTime, req.IsWorkingDay); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando horario"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Horario actualizado"})
}

// ========== ROLES & PERMISSIONS ==========

// GetOperatorRoles obtiene roles disponibles
func (h *OperatorDBHandler) GetOperatorRoles(c *gin.Context) {
	roles, err := h.repo.GetOperatorRoles(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo roles"})
		return
	}
	c.JSON(http.StatusOK, roles)
}

// GetMyRoles obtiene roles del operador actual
func (h *OperatorDBHandler) GetMyRoles(c *gin.Context) {
	operatorID := h.getOperatorID(c)
	if operatorID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Operador no encontrado"})
		return
	}

	roles, err := h.repo.GetOperatorAssignedRoles(c.Request.Context(), operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo roles"})
		return
	}
	c.JSON(http.StatusOK, roles)
}

// AssignRole asigna un rol a un operador
func (h *OperatorDBHandler) AssignRole(c *gin.Context) {
	var req struct {
		OperatorID int64 `json:"operator_id" binding:"required"`
		RoleID     int64 `json:"role_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	grantedBy := h.getOperatorID(c)
	if err := h.repo.AssignRoleToOperator(c.Request.Context(), req.OperatorID, req.RoleID, grantedBy); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error asignando rol"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Rol asignado"})
}

// RemoveRole remueve un rol de un operador
func (h *OperatorDBHandler) RemoveRole(c *gin.Context) {
	var req struct {
		OperatorID int64 `json:"operator_id" binding:"required"`
		RoleID     int64 `json:"role_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if err := h.repo.RemoveRoleFromOperator(c.Request.Context(), req.OperatorID, req.RoleID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error removiendo rol"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Rol removido"})
}

// GetAllPermissions obtiene todos los permisos disponibles
func (h *OperatorDBHandler) GetAllPermissions(c *gin.Context) {
	permissions, err := h.repo.GetAllPermissions(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo permisos"})
		return
	}
	c.JSON(http.StatusOK, permissions)
}

// GetMyPermissions obtiene permisos del operador actual
func (h *OperatorDBHandler) GetMyPermissions(c *gin.Context) {
	operatorID := h.getOperatorID(c)
	if operatorID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Operador no encontrado"})
		return
	}

	permissions, err := h.repo.GetOperatorPermissions(c.Request.Context(), operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo permisos"})
		return
	}
	c.JSON(http.StatusOK, permissions)
}


// ========== TOURNAMENT MANAGEMENT ==========

// GetTournamentActions obtiene acciones sobre torneos
func (h *OperatorDBHandler) GetTournamentActions(c *gin.Context) {
	tournamentID, _ := strconv.ParseInt(c.Query("tournament_id"), 10, 64)
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	actions, err := h.repo.GetTournamentActions(c.Request.Context(), tournamentID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo acciones"})
		return
	}
	c.JSON(http.StatusOK, actions)
}

// LogTournamentAction registra una acción sobre torneo
func (h *OperatorDBHandler) LogTournamentAction(c *gin.Context) {
	var req struct {
		TournamentID int64  `json:"tournament_id" binding:"required"`
		Action       string `json:"action" binding:"required"`
		Reason       string `json:"reason"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.LogTournamentAction(c.Request.Context(), operatorID, req.TournamentID, req.Action, req.Reason); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error registrando acción"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Acción registrada"})
}

// GetMyTournamentAssignments obtiene asignaciones de torneos del operador
func (h *OperatorDBHandler) GetMyTournamentAssignments(c *gin.Context) {
	operatorID := h.getOperatorID(c)
	if operatorID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Operador no encontrado"})
		return
	}

	assignments, err := h.repo.GetTournamentAssignments(c.Request.Context(), operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo asignaciones"})
		return
	}
	c.JSON(http.StatusOK, assignments)
}

// AssignTournament asigna un torneo a un operador
func (h *OperatorDBHandler) AssignTournament(c *gin.Context) {
	var req struct {
		TournamentID int64  `json:"tournament_id" binding:"required"`
		OperatorID   int64  `json:"operator_id" binding:"required"`
		Role         string `json:"role"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.Role == "" {
		req.Role = "monitor"
	}

	assignedBy := h.getOperatorID(c)
	if err := h.repo.AssignTournamentToOperator(c.Request.Context(), req.TournamentID, req.OperatorID, req.Role, assignedBy); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error asignando torneo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Torneo asignado"})
}

// GetDisqualifications obtiene descalificaciones
func (h *OperatorDBHandler) GetDisqualifications(c *gin.Context) {
	tournamentID, _ := strconv.ParseInt(c.Query("tournament_id"), 10, 64)
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	disqualifications, err := h.repo.GetDisqualifications(c.Request.Context(), tournamentID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo descalificaciones"})
		return
	}
	c.JSON(http.StatusOK, disqualifications)
}

// DisqualifyParticipant descalifica un participante
func (h *OperatorDBHandler) DisqualifyParticipant(c *gin.Context) {
	var req struct {
		TournamentID int64  `json:"tournament_id" binding:"required"`
		UserID       int64  `json:"user_id" binding:"required"`
		Reason       string `json:"reason" binding:"required"`
		IsPermanent  bool   `json:"is_permanent"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.DisqualifyParticipant(c.Request.Context(), req.TournamentID, req.UserID, operatorID, req.Reason, req.IsPermanent); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error descalificando participante"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Participante descalificado"})
}

// AddUserToTournament agrega manualmente un usuario a un torneo
func (h *OperatorDBHandler) AddUserToTournament(c *gin.Context) {
	var req struct {
		TournamentID int64  `json:"tournament_id" binding:"required"`
		UserID       int64  `json:"user_id" binding:"required"`
		Reason       string `json:"reason"`
		WaiveFee     bool   `json:"waive_fee"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.AddUserToTournament(c.Request.Context(), req.TournamentID, req.UserID, operatorID, req.Reason, req.WaiveFee); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error agregando usuario"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Usuario agregado al torneo"})
}


// ========== USER MANAGEMENT ==========

// GetUserNotes obtiene notas de un usuario
func (h *OperatorDBHandler) GetUserNotes(c *gin.Context) {
	userID, err := strconv.ParseInt(c.Param("userId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
		return
	}

	notes, err := h.repo.GetUserNotes(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo notas"})
		return
	}
	c.JSON(http.StatusOK, notes)
}

// AddUserNote agrega una nota a un usuario
func (h *OperatorDBHandler) AddUserNote(c *gin.Context) {
	userID, err := strconv.ParseInt(c.Param("userId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
		return
	}

	var req struct {
		Note     string `json:"note" binding:"required"`
		Priority string `json:"priority"`
		IsPinned bool   `json:"is_pinned"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nota requerida"})
		return
	}

	if req.Priority == "" {
		req.Priority = "medium"
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.AddUserNote(c.Request.Context(), userID, operatorID, req.Note, req.Priority, req.IsPinned)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error agregando nota"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Nota agregada"})
}

// DeleteUserNote elimina una nota
func (h *OperatorDBHandler) DeleteUserNote(c *gin.Context) {
	noteID, err := strconv.ParseInt(c.Param("noteId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de nota inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.DeleteUserNote(c.Request.Context(), noteID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando nota"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Nota eliminada"})
}

// GetBalanceAdjustments obtiene ajustes de balance
func (h *OperatorDBHandler) GetBalanceAdjustments(c *gin.Context) {
	userID, _ := strconv.ParseInt(c.Query("user_id"), 10, 64)
	status := c.Query("status")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	adjustments, err := h.repo.GetBalanceAdjustments(c.Request.Context(), userID, status, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo ajustes"})
		return
	}
	c.JSON(http.StatusOK, adjustments)
}

// CreateBalanceAdjustment crea un ajuste de balance
func (h *OperatorDBHandler) CreateBalanceAdjustment(c *gin.Context) {
	var req struct {
		UserID         int64   `json:"user_id" binding:"required"`
		WalletType     string  `json:"wallet_type"`
		AdjustmentType string  `json:"adjustment_type" binding:"required"`
		Amount         float64 `json:"amount" binding:"required"`
		Reason         string  `json:"reason" binding:"required"`
		Category       string  `json:"category"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.WalletType == "" {
		req.WalletType = "real"
	}
	if req.Category == "" {
		req.Category = "other"
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateBalanceAdjustment(c.Request.Context(), req.UserID, operatorID, req.WalletType, req.AdjustmentType, req.Amount, req.Reason, req.Category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando ajuste"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Ajuste creado"})
}

// ApproveBalanceAdjustment aprueba un ajuste
func (h *OperatorDBHandler) ApproveBalanceAdjustment(c *gin.Context) {
	adjustmentID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.ApproveBalanceAdjustment(c.Request.Context(), adjustmentID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error aprobando ajuste"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Ajuste aprobado"})
}

// RejectBalanceAdjustment rechaza un ajuste
func (h *OperatorDBHandler) RejectBalanceAdjustment(c *gin.Context) {
	adjustmentID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.repo.RejectBalanceAdjustment(c.Request.Context(), adjustmentID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error rechazando ajuste"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Ajuste rechazado"})
}


// GetUserStatusChanges obtiene cambios de estado
func (h *OperatorDBHandler) GetUserStatusChanges(c *gin.Context) {
	userID, err := strconv.ParseInt(c.Param("userId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
		return
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	changes, err := h.repo.GetUserStatusChanges(c.Request.Context(), userID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo cambios"})
		return
	}
	c.JSON(http.StatusOK, changes)
}

// ChangeUserStatus cambia el estado de un usuario
func (h *OperatorDBHandler) ChangeUserStatus(c *gin.Context) {
	userID, err := strconv.ParseInt(c.Param("userId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
		return
	}

	var req struct {
		NewStatus     string `json:"new_status" binding:"required"`
		Reason        string `json:"reason" binding:"required"`
		DurationHours *int   `json:"duration_hours"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.ChangeUserStatus(c.Request.Context(), userID, operatorID, req.NewStatus, req.Reason, req.DurationHours); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error cambiando estado"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Estado cambiado"})
}

// GetTradingBlocks obtiene bloqueos de trading
func (h *OperatorDBHandler) GetTradingBlocks(c *gin.Context) {
	userID, err := strconv.ParseInt(c.Param("userId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
		return
	}
	activeOnly := c.Query("active_only") == "true"

	blocks, err := h.repo.GetTradingBlocks(c.Request.Context(), userID, activeOnly)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo bloqueos"})
		return
	}
	c.JSON(http.StatusOK, blocks)
}

// CreateTradingBlock crea un bloqueo de trading
func (h *OperatorDBHandler) CreateTradingBlock(c *gin.Context) {
	userID, err := strconv.ParseInt(c.Param("userId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
		return
	}

	var req struct {
		BlockType      string    `json:"block_type"`
		BlockedSymbols []string  `json:"blocked_symbols"`
		MaxAmount      *float64  `json:"max_amount"`
		Reason         string    `json:"reason" binding:"required"`
		ExpiresAt      *string   `json:"expires_at"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Razón requerida"})
		return
	}

	if req.BlockType == "" {
		req.BlockType = "full"
	}

	var expiresAt *time.Time
	if req.ExpiresAt != nil {
		t, _ := time.Parse(time.RFC3339, *req.ExpiresAt)
		expiresAt = &t
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateTradingBlock(c.Request.Context(), userID, operatorID, req.BlockType, req.Reason, req.BlockedSymbols, req.MaxAmount, expiresAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando bloqueo"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Bloqueo creado"})
}

// RemoveTradingBlock desactiva un bloqueo
func (h *OperatorDBHandler) RemoveTradingBlock(c *gin.Context) {
	blockID, err := strconv.ParseInt(c.Param("blockId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.repo.RemoveTradingBlock(c.Request.Context(), blockID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error removiendo bloqueo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Bloqueo removido"})
}

// GetRiskAssessments obtiene evaluaciones de riesgo
func (h *OperatorDBHandler) GetRiskAssessments(c *gin.Context) {
	userID, err := strconv.ParseInt(c.Param("userId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
		return
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	assessments, err := h.repo.GetRiskAssessments(c.Request.Context(), userID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo evaluaciones"})
		return
	}
	c.JSON(http.StatusOK, assessments)
}

// CreateRiskAssessment crea una evaluación de riesgo
func (h *OperatorDBHandler) CreateRiskAssessment(c *gin.Context) {
	userID, err := strconv.ParseInt(c.Param("userId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
		return
	}

	var req struct {
		NewLevel string   `json:"new_level" binding:"required"`
		Factors  []string `json:"factors"`
		Notes    string   `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nivel requerido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.CreateRiskAssessment(c.Request.Context(), userID, operatorID, req.NewLevel, req.Notes, req.Factors); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando evaluación"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Evaluación creada"})
}

// GetMonitoredUsers obtiene usuarios monitoreados
func (h *OperatorDBHandler) GetMonitoredUsers(c *gin.Context) {
	activeOnly := c.Query("active_only") != "false"
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	operatorID := h.getOperatorID(c)
	users, err := h.repo.GetMonitoredUsers(c.Request.Context(), operatorID, activeOnly, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo usuarios"})
		return
	}
	c.JSON(http.StatusOK, users)
}

// AddMonitoredUser agrega un usuario a monitoreo
func (h *OperatorDBHandler) AddMonitoredUser(c *gin.Context) {
	var req struct {
		UserID         int64   `json:"user_id" binding:"required"`
		Reason         string  `json:"reason" binding:"required"`
		Priority       string  `json:"priority"`
		MonitoringType string  `json:"monitoring_type"`
		ExpiresAt      *string `json:"expires_at"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.Priority == "" {
		req.Priority = "medium"
	}
	if req.MonitoringType == "" {
		req.MonitoringType = "all_activity"
	}

	var expiresAt *time.Time
	if req.ExpiresAt != nil {
		t, _ := time.Parse(time.RFC3339, *req.ExpiresAt)
		expiresAt = &t
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.AddMonitoredUser(c.Request.Context(), req.UserID, operatorID, req.Reason, req.Priority, req.MonitoringType, expiresAt); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error agregando usuario"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Usuario agregado a monitoreo"})
}

// RemoveMonitoredUser remueve un usuario de monitoreo
func (h *OperatorDBHandler) RemoveMonitoredUser(c *gin.Context) {
	monitoredID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.repo.RemoveMonitoredUser(c.Request.Context(), monitoredID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error removiendo usuario"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Usuario removido de monitoreo"})
}


// ========== PART 3: TRADE CONTROL ==========

// GetTradeInterventions obtiene intervenciones de trades
func (h *OperatorDBHandler) GetTradeInterventions(c *gin.Context) {
	tradeID, _ := strconv.ParseInt(c.Query("trade_id"), 10, 64)
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	interventions, err := h.repo.GetTradeInterventions(c.Request.Context(), tradeID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo intervenciones"})
		return
	}
	c.JSON(http.StatusOK, interventions)
}

// CreateTradeIntervention crea una intervención
func (h *OperatorDBHandler) CreateTradeIntervention(c *gin.Context) {
	var req struct {
		TradeID          int64                  `json:"trade_id" binding:"required"`
		InterventionType string                 `json:"intervention_type" binding:"required"`
		Reason           string                 `json:"reason" binding:"required"`
		OriginalValue    map[string]interface{} `json:"original_value"`
		NewValue         map[string]interface{} `json:"new_value"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateTradeIntervention(c.Request.Context(), req.TradeID, operatorID, req.InterventionType, req.Reason, req.OriginalValue, req.NewValue)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando intervención"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Intervención creada"})
}

// RevertTradeIntervention revierte una intervención
func (h *OperatorDBHandler) RevertTradeIntervention(c *gin.Context) {
	interventionID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Reason string `json:"reason" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Razón requerida"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.RevertTradeIntervention(c.Request.Context(), interventionID, operatorID, req.Reason); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error revirtiendo intervención"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Intervención revertida"})
}


// GetTradeFlags obtiene banderas de trades
func (h *OperatorDBHandler) GetTradeFlags(c *gin.Context) {
	status := c.Query("status")
	severity := c.Query("severity")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	flags, err := h.repo.GetTradeFlags(c.Request.Context(), status, severity, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo banderas"})
		return
	}
	c.JSON(http.StatusOK, flags)
}

// CreateTradeFlag crea una bandera de trade
func (h *OperatorDBHandler) CreateTradeFlag(c *gin.Context) {
	var req struct {
		TradeID  int64                  `json:"trade_id" binding:"required"`
		UserID   int64                  `json:"user_id" binding:"required"`
		FlagType string                 `json:"flag_type" binding:"required"`
		Severity string                 `json:"severity"`
		Reason   string                 `json:"reason" binding:"required"`
		Evidence map[string]interface{} `json:"evidence"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.Severity == "" {
		req.Severity = "medium"
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateTradeFlag(c.Request.Context(), req.TradeID, req.UserID, operatorID, req.FlagType, req.Severity, req.Reason, req.Evidence)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando bandera"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Bandera creada"})
}

// ResolveTradeFlag resuelve una bandera
func (h *OperatorDBHandler) ResolveTradeFlag(c *gin.Context) {
	flagID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Notes string `json:"notes"`
	}
	c.ShouldBindJSON(&req)

	operatorID := h.getOperatorID(c)
	if err := h.repo.ResolveTradeFlag(c.Request.Context(), flagID, operatorID, req.Notes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error resolviendo bandera"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Bandera resuelta"})
}

// DismissTradeFlag descarta una bandera
func (h *OperatorDBHandler) DismissTradeFlag(c *gin.Context) {
	flagID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Notes string `json:"notes"`
	}
	c.ShouldBindJSON(&req)

	operatorID := h.getOperatorID(c)
	if err := h.repo.DismissTradeFlag(c.Request.Context(), flagID, operatorID, req.Notes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error descartando bandera"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Bandera descartada"})
}

// EscalateTradeFlag escala una bandera
func (h *OperatorDBHandler) EscalateTradeFlag(c *gin.Context) {
	flagID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		EscalateTo int64 `json:"escalate_to" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Destino de escalación requerido"})
		return
	}

	if err := h.repo.EscalateTradeFlag(c.Request.Context(), flagID, req.EscalateTo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error escalando bandera"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Bandera escalada"})
}


// GetTradeCancellations obtiene cancelaciones de trades
func (h *OperatorDBHandler) GetTradeCancellations(c *gin.Context) {
	status := c.Query("status")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	cancellations, err := h.repo.GetTradeCancellations(c.Request.Context(), status, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo cancelaciones"})
		return
	}
	c.JSON(http.StatusOK, cancellations)
}

// CreateTradeCancellation crea una cancelación de trade
func (h *OperatorDBHandler) CreateTradeCancellation(c *gin.Context) {
	var req struct {
		TradeID          int64   `json:"trade_id" binding:"required"`
		UserID           int64   `json:"user_id" binding:"required"`
		CancellationType string  `json:"cancellation_type" binding:"required"`
		OriginalAmount   float64 `json:"original_amount" binding:"required"`
		Reason           string  `json:"reason" binding:"required"`
		RequiresApproval bool    `json:"requires_approval"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateTradeCancellation(c.Request.Context(), req.TradeID, req.UserID, operatorID, req.CancellationType, req.OriginalAmount, req.Reason, req.RequiresApproval)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando cancelación"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Cancelación creada"})
}

// ProcessTradeCancellation procesa una cancelación
func (h *OperatorDBHandler) ProcessTradeCancellation(c *gin.Context) {
	cancellationID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		RefundAmount float64 `json:"refund_amount" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Monto de reembolso requerido"})
		return
	}

	if err := h.repo.ProcessTradeCancellation(c.Request.Context(), cancellationID, req.RefundAmount); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error procesando cancelación"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cancelación procesada"})
}


// GetForcedTradeResults obtiene resultados forzados
func (h *OperatorDBHandler) GetForcedTradeResults(c *gin.Context) {
	status := c.Query("status")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	results, err := h.repo.GetForcedTradeResults(c.Request.Context(), status, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo resultados forzados"})
		return
	}
	c.JSON(http.StatusOK, results)
}

// CreateForcedTradeResult crea un resultado forzado
func (h *OperatorDBHandler) CreateForcedTradeResult(c *gin.Context) {
	var req struct {
		TradeID               int64    `json:"trade_id" binding:"required"`
		UserID                int64    `json:"user_id" binding:"required"`
		ForcedResult          string   `json:"forced_result" binding:"required"`
		ForcedPayout          *float64 `json:"forced_payout"`
		Reason                string   `json:"reason" binding:"required"`
		Justification         string   `json:"justification"`
		RequiresSeniorApproval bool    `json:"requires_senior_approval"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateForcedTradeResult(c.Request.Context(), req.TradeID, req.UserID, operatorID, req.ForcedResult, req.Reason, req.Justification, req.ForcedPayout, req.RequiresSeniorApproval)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando resultado forzado"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Resultado forzado creado"})
}

// ApproveForcedResult aprueba un resultado forzado
func (h *OperatorDBHandler) ApproveForcedResult(c *gin.Context) {
	resultID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.ApproveForcedResult(c.Request.Context(), resultID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error aprobando resultado"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Resultado aprobado"})
}

// RevertForcedResult revierte un resultado forzado
func (h *OperatorDBHandler) RevertForcedResult(c *gin.Context) {
	resultID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Reason string `json:"reason" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Razón requerida"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.RevertForcedResult(c.Request.Context(), resultID, operatorID, req.Reason); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error revirtiendo resultado"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Resultado revertido"})
}


// GetTradeReviewQueue obtiene cola de revisión
func (h *OperatorDBHandler) GetTradeReviewQueue(c *gin.Context) {
	status := c.Query("status")
	priority := c.Query("priority")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	items, err := h.repo.GetTradeReviewQueue(c.Request.Context(), status, priority, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo cola de revisión"})
		return
	}
	c.JSON(http.StatusOK, items)
}

// AssignTradeReview asigna un item de revisión
func (h *OperatorDBHandler) AssignTradeReview(c *gin.Context) {
	reviewID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.AssignTradeReview(c.Request.Context(), reviewID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error asignando revisión"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Revisión asignada"})
}

// CompleteTradeReview completa una revisión
func (h *OperatorDBHandler) CompleteTradeReview(c *gin.Context) {
	reviewID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Notes       string `json:"notes"`
		ActionTaken string `json:"action_taken" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Acción tomada requerida"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.CompleteTradeReview(c.Request.Context(), reviewID, operatorID, req.Notes, req.ActionTaken); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error completando revisión"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Revisión completada"})
}


// GetTradePatterns obtiene patrones detectados
func (h *OperatorDBHandler) GetTradePatterns(c *gin.Context) {
	patternType := c.Query("pattern_type")
	status := c.Query("status")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	patterns, err := h.repo.GetTradePatterns(c.Request.Context(), patternType, status, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo patrones"})
		return
	}
	c.JSON(http.StatusOK, patterns)
}

// ReportTradePattern reporta un patrón manualmente
func (h *OperatorDBHandler) ReportTradePattern(c *gin.Context) {
	var req struct {
		UserID         int64   `json:"user_id" binding:"required"`
		PatternType    string  `json:"pattern_type" binding:"required"`
		AffectedTrades []int64 `json:"affected_trades"`
		Notes          string  `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.ReportTradePattern(c.Request.Context(), req.UserID, operatorID, req.PatternType, req.AffectedTrades, req.Notes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reportando patrón"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Patrón reportado"})
}

// UpdatePatternStatus actualiza estado de un patrón
func (h *OperatorDBHandler) UpdatePatternStatus(c *gin.Context) {
	patternID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Status      string `json:"status" binding:"required"`
		Notes       string `json:"notes"`
		ActionTaken string `json:"action_taken"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Estado requerido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.UpdatePatternStatus(c.Request.Context(), patternID, operatorID, req.Status, req.Notes, req.ActionTaken); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando patrón"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Patrón actualizado"})
}


// GetTradeLimitOverrides obtiene sobrescrituras de límites
func (h *OperatorDBHandler) GetTradeLimitOverrides(c *gin.Context) {
	userID, _ := strconv.ParseInt(c.Query("user_id"), 10, 64)
	activeOnly := c.Query("active_only") != "false"
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	overrides, err := h.repo.GetTradeLimitOverrides(c.Request.Context(), userID, activeOnly, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo sobrescrituras"})
		return
	}
	c.JSON(http.StatusOK, overrides)
}

// CreateTradeLimitOverride crea una sobrescritura de límite
func (h *OperatorDBHandler) CreateTradeLimitOverride(c *gin.Context) {
	var req struct {
		UserID    int64    `json:"user_id" binding:"required"`
		LimitType string   `json:"limit_type" binding:"required"`
		NewLimit  float64  `json:"new_limit" binding:"required"`
		Reason    string   `json:"reason" binding:"required"`
		ExpiresAt *string  `json:"expires_at"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	var expiresAt *time.Time
	if req.ExpiresAt != nil {
		t, _ := time.Parse(time.RFC3339, *req.ExpiresAt)
		expiresAt = &t
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateTradeLimitOverride(c.Request.Context(), req.UserID, operatorID, req.LimitType, req.NewLimit, req.Reason, expiresAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando sobrescritura"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Sobrescritura creada"})
}

// DeactivateTradeLimitOverride desactiva una sobrescritura
func (h *OperatorDBHandler) DeactivateTradeLimitOverride(c *gin.Context) {
	overrideID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.DeactivateTradeLimitOverride(c.Request.Context(), overrideID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error desactivando sobrescritura"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Sobrescritura desactivada"})
}


// ========== PART 4: ALERT SYSTEM ==========

// GetOperatorAlerts obtiene alertas
func (h *OperatorDBHandler) GetOperatorAlerts(c *gin.Context) {
	alertType := c.Query("alert_type")
	severity := c.Query("severity")
	status := c.Query("status")
	assignedTo, _ := strconv.ParseInt(c.Query("assigned_to"), 10, 64)
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	alerts, err := h.repo.GetOperatorAlerts(c.Request.Context(), alertType, severity, status, assignedTo, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo alertas"})
		return
	}
	c.JSON(http.StatusOK, alerts)
}

// GetAlertByID obtiene una alerta por ID
func (h *OperatorDBHandler) GetAlertByID(c *gin.Context) {
	alertID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	alert, err := h.repo.GetAlertByID(c.Request.Context(), alertID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Alerta no encontrada"})
		return
	}
	c.JSON(http.StatusOK, alert)
}

// CreateOperatorAlert crea una alerta
func (h *OperatorDBHandler) CreateOperatorAlert(c *gin.Context) {
	var req struct {
		AlertType  string  `json:"alert_type" binding:"required"`
		Severity   string  `json:"severity"`
		Title      string  `json:"title" binding:"required"`
		Message    string  `json:"message" binding:"required"`
		SourceID   *int64  `json:"source_id"`
		SourceType *string `json:"source_type"`
		UserID     *int64  `json:"user_id"`
		Priority   int     `json:"priority"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.Severity == "" {
		req.Severity = "medium"
	}
	if req.Priority == 0 {
		req.Priority = 5
	}

	id, err := h.repo.CreateOperatorAlert(c.Request.Context(), req.AlertType, req.Severity, req.Title, req.Message, "manual", req.SourceID, req.SourceType, req.UserID, req.Priority)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando alerta"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Alerta creada"})
}


// AcknowledgeAlert reconoce una alerta
func (h *OperatorDBHandler) AcknowledgeAlert(c *gin.Context) {
	alertID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.AcknowledgeAlert(c.Request.Context(), alertID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reconociendo alerta"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Alerta reconocida"})
}

// AssignAlert asigna una alerta
func (h *OperatorDBHandler) AssignAlert(c *gin.Context) {
	alertID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		OperatorID int64 `json:"operator_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de operador requerido"})
		return
	}

	if err := h.repo.AssignAlert(c.Request.Context(), alertID, req.OperatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error asignando alerta"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Alerta asignada"})
}

// ResolveAlert resuelve una alerta
func (h *OperatorDBHandler) ResolveAlert(c *gin.Context) {
	alertID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Notes string `json:"notes"`
	}
	c.ShouldBindJSON(&req)

	operatorID := h.getOperatorID(c)
	if err := h.repo.ResolveAlert(c.Request.Context(), alertID, operatorID, req.Notes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error resolviendo alerta"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Alerta resuelta"})
}

// DismissAlert descarta una alerta
func (h *OperatorDBHandler) DismissAlert(c *gin.Context) {
	alertID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Notes string `json:"notes"`
	}
	c.ShouldBindJSON(&req)

	operatorID := h.getOperatorID(c)
	if err := h.repo.DismissAlert(c.Request.Context(), alertID, operatorID, req.Notes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error descartando alerta"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Alerta descartada"})
}

// MarkAlertRead marca una alerta como leída
func (h *OperatorDBHandler) MarkAlertRead(c *gin.Context) {
	alertID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.repo.MarkAlertRead(c.Request.Context(), alertID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error marcando alerta"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Alerta marcada como leída"})
}

// GetUnreadAlertCount obtiene conteo de alertas no leídas
func (h *OperatorDBHandler) GetUnreadAlertCount(c *gin.Context) {
	operatorID := h.getOperatorID(c)
	count, err := h.repo.GetUnreadAlertCount(c.Request.Context(), operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo conteo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"count": count})
}


// GetAlertRules obtiene reglas de alertas
func (h *OperatorDBHandler) GetAlertRules(c *gin.Context) {
	activeOnly := c.Query("active_only") != "false"

	rules, err := h.repo.GetAlertRules(c.Request.Context(), activeOnly)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo reglas"})
		return
	}
	c.JSON(http.StatusOK, rules)
}

// CreateAlertRule crea una regla de alerta
func (h *OperatorDBHandler) CreateAlertRule(c *gin.Context) {
	var req struct {
		Name            string                 `json:"name" binding:"required"`
		RuleType        string                 `json:"rule_type" binding:"required"`
		TriggerEvent    string                 `json:"trigger_event" binding:"required"`
		Conditions      map[string]interface{} `json:"conditions" binding:"required"`
		AlertType       string                 `json:"alert_type" binding:"required"`
		AlertSeverity   string                 `json:"alert_severity"`
		TitleTemplate   string                 `json:"title_template"`
		MessageTemplate string                 `json:"message_template"`
		AutoAssignTo    *int64                 `json:"auto_assign_to"`
		CooldownMinutes int                    `json:"cooldown_minutes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.AlertSeverity == "" {
		req.AlertSeverity = "medium"
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateAlertRule(c.Request.Context(), req.Name, req.RuleType, req.TriggerEvent, req.AlertType, req.AlertSeverity, req.Conditions, req.TitleTemplate, req.MessageTemplate, req.AutoAssignTo, req.CooldownMinutes, operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando regla"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Regla creada"})
}

// ToggleAlertRule activa/desactiva una regla
func (h *OperatorDBHandler) ToggleAlertRule(c *gin.Context) {
	ruleID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.repo.ToggleAlertRule(c.Request.Context(), ruleID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando regla"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Regla actualizada"})
}

// DeleteAlertRule elimina una regla
func (h *OperatorDBHandler) DeleteAlertRule(c *gin.Context) {
	ruleID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.repo.DeleteAlertRule(c.Request.Context(), ruleID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando regla"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Regla eliminada"})
}


// EscalateAlert escala una alerta
func (h *OperatorDBHandler) EscalateAlert(c *gin.Context) {
	alertID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		ToOperatorID *int64 `json:"to_operator_id"`
		ToDepartment string `json:"to_department"`
		Reason       string `json:"reason" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Razón requerida"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.EscalateAlert(c.Request.Context(), alertID, operatorID, req.ToOperatorID, req.ToDepartment, req.Reason); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error escalando alerta"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Alerta escalada"})
}

// GetAlertEscalations obtiene escalaciones de una alerta
func (h *OperatorDBHandler) GetAlertEscalations(c *gin.Context) {
	alertID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	escalations, err := h.repo.GetAlertEscalations(c.Request.Context(), alertID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo escalaciones"})
		return
	}
	c.JSON(http.StatusOK, escalations)
}

// GetAlertComments obtiene comentarios de una alerta
func (h *OperatorDBHandler) GetAlertComments(c *gin.Context) {
	alertID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	comments, err := h.repo.GetAlertComments(c.Request.Context(), alertID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo comentarios"})
		return
	}
	c.JSON(http.StatusOK, comments)
}

// AddAlertComment agrega un comentario a una alerta
func (h *OperatorDBHandler) AddAlertComment(c *gin.Context) {
	alertID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Comment    string `json:"comment" binding:"required"`
		IsInternal bool   `json:"is_internal"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Comentario requerido"})
		return
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.AddAlertComment(c.Request.Context(), alertID, operatorID, req.Comment, req.IsInternal)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error agregando comentario"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Comentario agregado"})
}


// GetAlertSubscriptions obtiene suscripciones del operador
func (h *OperatorDBHandler) GetAlertSubscriptions(c *gin.Context) {
	operatorID := h.getOperatorID(c)
	if operatorID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Operador no encontrado"})
		return
	}

	subs, err := h.repo.GetAlertSubscriptions(c.Request.Context(), operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo suscripciones"})
		return
	}
	c.JSON(http.StatusOK, subs)
}

// UpdateAlertSubscription actualiza una suscripción
func (h *OperatorDBHandler) UpdateAlertSubscription(c *gin.Context) {
	var req struct {
		AlertType      string   `json:"alert_type" binding:"required"`
		SeverityFilter []string `json:"severity_filter"`
		NotifyEmail    bool     `json:"notify_email"`
		NotifyPush     bool     `json:"notify_push"`
		NotifySMS      bool     `json:"notify_sms"`
		IsActive       bool     `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tipo de alerta requerido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if operatorID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Operador no encontrado"})
		return
	}

	if err := h.repo.UpdateAlertSubscription(c.Request.Context(), operatorID, req.AlertType, req.SeverityFilter, req.NotifyEmail, req.NotifyPush, req.NotifySMS, req.IsActive); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando suscripción"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Suscripción actualizada"})
}

// GetAlertStats obtiene estadísticas de alertas
func (h *OperatorDBHandler) GetAlertStats(c *gin.Context) {
	stats, err := h.repo.GetAlertStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estadísticas"})
		return
	}
	c.JSON(http.StatusOK, stats)
}


// ========== PART 5: ASSET CONFIGURATION ==========

// GetAssetCategories obtiene categorías de activos
func (h *OperatorDBHandler) GetAssetCategories(c *gin.Context) {
	activeOnly := c.Query("active_only") != "false"

	categories, err := h.repo.GetAssetCategories(c.Request.Context(), activeOnly)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo categorías"})
		return
	}
	c.JSON(http.StatusOK, categories)
}

// CreateAssetCategory crea una categoría
func (h *OperatorDBHandler) CreateAssetCategory(c *gin.Context) {
	var req struct {
		Name         string  `json:"name" binding:"required"`
		Slug         string  `json:"slug" binding:"required"`
		Description  *string `json:"description"`
		Icon         *string `json:"icon"`
		DisplayOrder int     `json:"display_order"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateAssetCategory(c.Request.Context(), req.Name, req.Slug, req.Description, req.Icon, req.DisplayOrder, operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando categoría"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Categoría creada"})
}

// UpdateAssetCategory actualiza una categoría
func (h *OperatorDBHandler) UpdateAssetCategory(c *gin.Context) {
	categoryID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Name         string  `json:"name" binding:"required"`
		Description  *string `json:"description"`
		Icon         *string `json:"icon"`
		DisplayOrder int     `json:"display_order"`
		IsActive     bool    `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if err := h.repo.UpdateAssetCategory(c.Request.Context(), categoryID, req.Name, req.Description, req.Icon, req.DisplayOrder, req.IsActive); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando categoría"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Categoría actualizada"})
}


// GetTradingAssets obtiene activos de trading
func (h *OperatorDBHandler) GetTradingAssets(c *gin.Context) {
	categoryID, _ := strconv.ParseInt(c.Query("category_id"), 10, 64)
	assetType := c.Query("asset_type")
	activeOnly := c.Query("active_only") != "false"
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))

	assets, err := h.repo.GetTradingAssets(c.Request.Context(), categoryID, assetType, activeOnly, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo activos"})
		return
	}
	c.JSON(http.StatusOK, assets)
}

// CreateTradingAsset crea un activo de trading
func (h *OperatorDBHandler) CreateTradingAsset(c *gin.Context) {
	var req struct {
		Symbol      string  `json:"symbol" binding:"required"`
		Name        string  `json:"name" binding:"required"`
		AssetType   string  `json:"asset_type"`
		CategoryID  *int64  `json:"category_id"`
		MinAmount   float64 `json:"min_trade_amount"`
		MaxAmount   float64 `json:"max_trade_amount"`
		MinDuration int     `json:"min_duration_seconds"`
		MaxDuration int     `json:"max_duration_seconds"`
		Payout      float64 `json:"payout_percentage"`
		Spread      float64 `json:"spread"`
		RiskLevel   string  `json:"risk_level"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.AssetType == "" {
		req.AssetType = "crypto"
	}
	if req.MinAmount == 0 {
		req.MinAmount = 1
	}
	if req.MaxAmount == 0 {
		req.MaxAmount = 10000
	}
	if req.MinDuration == 0 {
		req.MinDuration = 30
	}
	if req.MaxDuration == 0 {
		req.MaxDuration = 3600
	}
	if req.Payout == 0 {
		req.Payout = 85
	}
	if req.RiskLevel == "" {
		req.RiskLevel = "medium"
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateTradingAsset(c.Request.Context(), req.Symbol, req.Name, req.AssetType, req.CategoryID, req.MinAmount, req.MaxAmount, req.MinDuration, req.MaxDuration, req.Payout, req.Spread, req.RiskLevel, operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando activo"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Activo creado"})
}

// UpdateTradingAsset actualiza un activo
func (h *OperatorDBHandler) UpdateTradingAsset(c *gin.Context) {
	assetID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Name        string  `json:"name" binding:"required"`
		CategoryID  *int64  `json:"category_id"`
		MinAmount   float64 `json:"min_trade_amount"`
		MaxAmount   float64 `json:"max_trade_amount"`
		MinDuration int     `json:"min_duration_seconds"`
		MaxDuration int     `json:"max_duration_seconds"`
		Payout      float64 `json:"payout_percentage"`
		Spread      float64 `json:"spread"`
		RiskLevel   string  `json:"risk_level"`
		IsActive    bool    `json:"is_active"`
		IsFeatured  bool    `json:"is_featured"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if err := h.repo.UpdateTradingAsset(c.Request.Context(), assetID, req.Name, req.CategoryID, req.MinAmount, req.MaxAmount, req.MinDuration, req.MaxDuration, req.Payout, req.Spread, req.RiskLevel, req.IsActive, req.IsFeatured); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando activo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Activo actualizado"})
}

// ToggleAssetStatus activa/desactiva un activo
func (h *OperatorDBHandler) ToggleAssetStatus(c *gin.Context) {
	assetID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.repo.ToggleAssetStatus(c.Request.Context(), assetID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando activo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Estado actualizado"})
}


// GetAssetPayoutRules obtiene reglas de payout
func (h *OperatorDBHandler) GetAssetPayoutRules(c *gin.Context) {
	assetID, err := strconv.ParseInt(c.Param("assetId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de activo inválido"})
		return
	}

	rules, err := h.repo.GetAssetPayoutRules(c.Request.Context(), assetID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo reglas"})
		return
	}
	c.JSON(http.StatusOK, rules)
}

// CreateAssetPayoutRule crea una regla de payout
func (h *OperatorDBHandler) CreateAssetPayoutRule(c *gin.Context) {
	assetID, err := strconv.ParseInt(c.Param("assetId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de activo inválido"})
		return
	}

	var req struct {
		RuleName         string                 `json:"rule_name" binding:"required"`
		ConditionType    string                 `json:"condition_type" binding:"required"`
		ConditionValue   map[string]interface{} `json:"condition_value" binding:"required"`
		PayoutAdjustment float64                `json:"payout_adjustment" binding:"required"`
		Priority         int                    `json:"priority"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateAssetPayoutRule(c.Request.Context(), assetID, req.RuleName, req.ConditionType, req.ConditionValue, req.PayoutAdjustment, req.Priority, operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando regla"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Regla creada"})
}

// DeleteAssetPayoutRule elimina una regla
func (h *OperatorDBHandler) DeleteAssetPayoutRule(c *gin.Context) {
	ruleID, err := strconv.ParseInt(c.Param("ruleId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de regla inválido"})
		return
	}

	if err := h.repo.DeleteAssetPayoutRule(c.Request.Context(), ruleID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando regla"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Regla eliminada"})
}


// ========== TEAM CHAT ==========

// GetChatChannels obtiene canales de chat
func (h *OperatorDBHandler) GetChatChannels(c *gin.Context) {
	operatorID := h.getOperatorID(c)
	if operatorID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Operador no encontrado"})
		return
	}
	channelType := c.Query("channel_type")

	channels, err := h.repo.GetChatChannels(c.Request.Context(), operatorID, channelType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo canales"})
		return
	}
	c.JSON(http.StatusOK, channels)
}

// CreateChatChannel crea un canal
func (h *OperatorDBHandler) CreateChatChannel(c *gin.Context) {
	var req struct {
		Name        string  `json:"name" binding:"required"`
		Slug        string  `json:"slug" binding:"required"`
		ChannelType string  `json:"channel_type"`
		Description *string `json:"description"`
		Department  *string `json:"department"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.ChannelType == "" {
		req.ChannelType = "public"
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateChatChannel(c.Request.Context(), req.Name, req.Slug, req.ChannelType, req.Description, req.Department, operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando canal"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Canal creado"})
}

// JoinChatChannel une a un operador a un canal
func (h *OperatorDBHandler) JoinChatChannel(c *gin.Context) {
	channelID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.JoinChatChannel(c.Request.Context(), channelID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error uniéndose al canal"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Unido al canal"})
}

// LeaveChatChannel remueve a un operador de un canal
func (h *OperatorDBHandler) LeaveChatChannel(c *gin.Context) {
	channelID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.LeaveChatChannel(c.Request.Context(), channelID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saliendo del canal"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Salió del canal"})
}


// GetChannelMessages obtiene mensajes de un canal
func (h *OperatorDBHandler) GetChannelMessages(c *gin.Context) {
	channelID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	var beforeID *int64
	if bid := c.Query("before_id"); bid != "" {
		id, _ := strconv.ParseInt(bid, 10, 64)
		beforeID = &id
	}

	messages, err := h.repo.GetChannelMessages(c.Request.Context(), channelID, limit, beforeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo mensajes"})
		return
	}
	c.JSON(http.StatusOK, messages)
}

// SendChannelMessage envía un mensaje a un canal
func (h *OperatorDBHandler) SendChannelMessage(c *gin.Context) {
	channelID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Content     string `json:"content" binding:"required"`
		MessageType string `json:"message_type"`
		ReplyToID   *int64 `json:"reply_to_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Contenido requerido"})
		return
	}

	if req.MessageType == "" {
		req.MessageType = "text"
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.SendChannelMessage(c.Request.Context(), channelID, operatorID, req.MessageType, req.Content, req.ReplyToID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error enviando mensaje"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Mensaje enviado"})
}

// EditChannelMessage edita un mensaje
func (h *OperatorDBHandler) EditChannelMessage(c *gin.Context) {
	messageID, err := strconv.ParseInt(c.Param("messageId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Contenido requerido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.EditChannelMessage(c.Request.Context(), messageID, operatorID, req.Content); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error editando mensaje"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Mensaje editado"})
}

// DeleteChannelMessage elimina un mensaje
func (h *OperatorDBHandler) DeleteChannelMessage(c *gin.Context) {
	messageID, err := strconv.ParseInt(c.Param("messageId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.DeleteChannelMessage(c.Request.Context(), messageID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando mensaje"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Mensaje eliminado"})
}

// PinChannelMessage fija un mensaje
func (h *OperatorDBHandler) PinChannelMessage(c *gin.Context) {
	messageID, err := strconv.ParseInt(c.Param("messageId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.PinChannelMessage(c.Request.Context(), messageID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fijando mensaje"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Mensaje fijado/desfijado"})
}


// GetDirectMessages obtiene mensajes directos
func (h *OperatorDBHandler) GetDirectMessages(c *gin.Context) {
	otherOperatorID, err := strconv.ParseInt(c.Param("operatorId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	operatorID := h.getOperatorID(c)
	messages, err := h.repo.GetDirectMessages(c.Request.Context(), operatorID, otherOperatorID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo mensajes"})
		return
	}
	c.JSON(http.StatusOK, messages)
}

// SendDirectMessage envía un mensaje directo
func (h *OperatorDBHandler) SendDirectMessage(c *gin.Context) {
	recipientID, err := strconv.ParseInt(c.Param("operatorId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Contenido requerido"})
		return
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.SendDirectMessage(c.Request.Context(), operatorID, recipientID, req.Content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error enviando mensaje"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Mensaje enviado"})
}

// MarkDirectMessagesRead marca mensajes como leídos
func (h *OperatorDBHandler) MarkDirectMessagesRead(c *gin.Context) {
	senderID, err := strconv.ParseInt(c.Param("operatorId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.MarkDirectMessagesRead(c.Request.Context(), operatorID, senderID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error marcando mensajes"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Mensajes marcados como leídos"})
}

// GetUnreadDMCount obtiene conteo de mensajes directos no leídos
func (h *OperatorDBHandler) GetUnreadDMCount(c *gin.Context) {
	operatorID := h.getOperatorID(c)
	count, err := h.repo.GetUnreadDMCount(c.Request.Context(), operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo conteo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"count": count})
}

// AddMessageReaction agrega una reacción
func (h *OperatorDBHandler) AddChatMessageReaction(c *gin.Context) {
	messageID, err := strconv.ParseInt(c.Param("messageId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Emoji string `json:"emoji" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Emoji requerido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.AddMessageReaction(c.Request.Context(), messageID, operatorID, req.Emoji); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error agregando reacción"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Reacción agregada"})
}

// RemoveMessageReaction remueve una reacción
func (h *OperatorDBHandler) RemoveChatMessageReaction(c *gin.Context) {
	messageID, err := strconv.ParseInt(c.Param("messageId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	emoji := c.Param("emoji")

	operatorID := h.getOperatorID(c)
	if err := h.repo.RemoveMessageReaction(c.Request.Context(), messageID, operatorID, emoji); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error removiendo reacción"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Reacción removida"})
}


// ========== PART 6: ACTIVITY LOGS ==========

// GetActivityLogs obtiene logs de actividad
func (h *OperatorDBHandler) GetActivityLogs(c *gin.Context) {
	operatorID, _ := strconv.ParseInt(c.Query("operator_id"), 10, 64)
	category := c.Query("category")
	activityType := c.Query("activity_type")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))

	logs, err := h.repo.GetActivityLogs(c.Request.Context(), operatorID, category, activityType, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo logs"})
		return
	}
	c.JSON(http.StatusOK, logs)
}

// GetMyActivityLogs obtiene logs del operador actual
func (h *OperatorDBHandler) GetMyActivityLogs(c *gin.Context) {
	operatorID := h.getOperatorID(c)
	if operatorID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Operador no encontrado"})
		return
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	logs, err := h.repo.GetMyActivityLogs(c.Request.Context(), operatorID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo logs"})
		return
	}
	c.JSON(http.StatusOK, logs)
}

// GetAuditTrail obtiene trail de auditoría
func (h *OperatorDBHandler) GetAuditTrail(c *gin.Context) {
	entityType := c.Query("entity_type")
	entityID, _ := strconv.ParseInt(c.Query("entity_id"), 10, 64)
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	entries, err := h.repo.GetAuditTrail(c.Request.Context(), entityType, entityID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo auditoría"})
		return
	}
	c.JSON(http.StatusOK, entries)
}

// GetLoginAttempts obtiene intentos de login
func (h *OperatorDBHandler) GetLoginAttempts(c *gin.Context) {
	operatorID, _ := strconv.ParseInt(c.Query("operator_id"), 10, 64)
	var successOnly *bool
	if s := c.Query("success"); s != "" {
		b := s == "true"
		successOnly = &b
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	attempts, err := h.repo.GetLoginAttempts(c.Request.Context(), operatorID, successOnly, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo intentos"})
		return
	}
	c.JSON(http.StatusOK, attempts)
}


// ========== REAL-TIME MONITORING ==========

// GetPlatformMetrics obtiene métricas de plataforma
func (h *OperatorDBHandler) GetPlatformMetrics(c *gin.Context) {
	metricType := c.Query("metric_type")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))

	metrics, err := h.repo.GetPlatformMetrics(c.Request.Context(), metricType, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo métricas"})
		return
	}
	c.JSON(http.StatusOK, metrics)
}

// GetLatestMetrics obtiene las métricas más recientes
func (h *OperatorDBHandler) GetLatestMetrics(c *gin.Context) {
	metrics, err := h.repo.GetLatestMetrics(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo métricas"})
		return
	}
	c.JSON(http.StatusOK, metrics)
}

// GetActiveUsersMonitor obtiene usuarios activos
func (h *OperatorDBHandler) GetActiveUsersMonitor(c *gin.Context) {
	var isTrading *bool
	if t := c.Query("is_trading"); t != "" {
		b := t == "true"
		isTrading = &b
	}
	minRiskScore, _ := strconv.Atoi(c.Query("min_risk_score"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))

	users, err := h.repo.GetActiveUsersMonitor(c.Request.Context(), isTrading, minRiskScore, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo usuarios"})
		return
	}
	c.JSON(http.StatusOK, users)
}

// GetActiveTradesMonitor obtiene trades activos
func (h *OperatorDBHandler) GetActiveTradesMonitor(c *gin.Context) {
	symbol := c.Query("symbol")
	var isDemo *bool
	if d := c.Query("is_demo"); d != "" {
		b := d == "true"
		isDemo = &b
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))

	trades, err := h.repo.GetActiveTradesMonitor(c.Request.Context(), symbol, isDemo, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo trades"})
		return
	}
	c.JSON(http.StatusOK, trades)
}

// GetSystemHealth obtiene estado de salud del sistema
func (h *OperatorDBHandler) GetSystemHealth(c *gin.Context) {
	health, err := h.repo.GetSystemHealth(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estado"})
		return
	}
	c.JSON(http.StatusOK, health)
}

// GetRealtimeAlerts obtiene alertas en tiempo real
func (h *OperatorDBHandler) GetRealtimeAlerts(c *gin.Context) {
	operatorID := h.getOperatorID(c)
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	alerts, err := h.repo.GetRealtimeAlerts(c.Request.Context(), operatorID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo alertas"})
		return
	}
	c.JSON(http.StatusOK, alerts)
}


// GetMonitoringThresholds obtiene umbrales de monitoreo
func (h *OperatorDBHandler) GetMonitoringThresholds(c *gin.Context) {
	activeOnly := c.Query("active_only") != "false"

	thresholds, err := h.repo.GetMonitoringThresholds(c.Request.Context(), activeOnly)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo umbrales"})
		return
	}
	c.JSON(http.StatusOK, thresholds)
}

// CreateMonitoringThreshold crea un umbral
func (h *OperatorDBHandler) CreateMonitoringThreshold(c *gin.Context) {
	var req struct {
		MetricName         string   `json:"metric_name" binding:"required"`
		WarningThreshold   *float64 `json:"warning_threshold"`
		CriticalThreshold  *float64 `json:"critical_threshold"`
		ComparisonOperator string   `json:"comparison_operator"`
		AlertOnBreach      bool     `json:"alert_on_breach"`
		CooldownMinutes    int      `json:"cooldown_minutes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.ComparisonOperator == "" {
		req.ComparisonOperator = ">"
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateMonitoringThreshold(c.Request.Context(), req.MetricName, req.WarningThreshold, req.CriticalThreshold, req.ComparisonOperator, req.AlertOnBreach, req.CooldownMinutes, operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando umbral"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Umbral creado"})
}

// UpdateMonitoringThreshold actualiza un umbral
func (h *OperatorDBHandler) UpdateMonitoringThreshold(c *gin.Context) {
	thresholdID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		WarningThreshold  *float64 `json:"warning_threshold"`
		CriticalThreshold *float64 `json:"critical_threshold"`
		AlertOnBreach     bool     `json:"alert_on_breach"`
		CooldownMinutes   int      `json:"cooldown_minutes"`
		IsActive          bool     `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if err := h.repo.UpdateMonitoringThreshold(c.Request.Context(), thresholdID, req.WarningThreshold, req.CriticalThreshold, req.AlertOnBreach, req.CooldownMinutes, req.IsActive); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando umbral"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Umbral actualizado"})
}

// DeleteMonitoringThreshold elimina un umbral
func (h *OperatorDBHandler) DeleteMonitoringThreshold(c *gin.Context) {
	thresholdID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.repo.DeleteMonitoringThreshold(c.Request.Context(), thresholdID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando umbral"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Umbral eliminado"})
}

// GetMonitoringSummary obtiene resumen de monitoreo
func (h *OperatorDBHandler) GetMonitoringSummary(c *gin.Context) {
	summary, err := h.repo.GetMonitoringSummary(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo resumen"})
		return
	}
	c.JSON(http.StatusOK, summary)
}

// ========== PART 7: REPORTS ==========

// GetReports obtiene reportes
func (h *OperatorDBHandler) GetReports(c *gin.Context) {
	reportType := c.Query("report_type")
	status := c.Query("status")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	reports, err := h.repo.GetReports(c.Request.Context(), reportType, status, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo reportes"})
		return
	}
	c.JSON(http.StatusOK, reports)
}

// CreateReport crea un nuevo reporte
func (h *OperatorDBHandler) CreateReport(c *gin.Context) {
	var req struct {
		ReportType  string     `json:"report_type" binding:"required"`
		ReportName  string     `json:"report_name" binding:"required"`
		Description *string    `json:"description"`
		PeriodStart *time.Time `json:"period_start"`
		PeriodEnd   *time.Time `json:"period_end"`
		Filters     string     `json:"filters"`
		FileFormat  string     `json:"file_format"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.Filters == "" {
		req.Filters = "{}"
	}
	if req.FileFormat == "" {
		req.FileFormat = "json"
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateReport(c.Request.Context(), req.ReportType, req.ReportName, req.Description, operatorID, req.PeriodStart, req.PeriodEnd, req.Filters, req.FileFormat)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando reporte"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Reporte creado"})
}

// GetReportTemplates obtiene plantillas de reportes
func (h *OperatorDBHandler) GetReportTemplates(c *gin.Context) {
	reportType := c.Query("report_type")
	activeOnly := c.Query("active_only") != "false"

	templates, err := h.repo.GetReportTemplates(c.Request.Context(), reportType, activeOnly)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo plantillas"})
		return
	}
	c.JSON(http.StatusOK, templates)
}

// GetDailySummaries obtiene resúmenes diarios
func (h *OperatorDBHandler) GetDailySummaries(c *gin.Context) {
	var startDate, endDate *time.Time
	if s := c.Query("start_date"); s != "" {
		if t, err := time.Parse("2006-01-02", s); err == nil {
			startDate = &t
		}
	}
	if e := c.Query("end_date"); e != "" {
		if t, err := time.Parse("2006-01-02", e); err == nil {
			endDate = &t
		}
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "30"))

	summaries, err := h.repo.GetDailySummaries(c.Request.Context(), startDate, endDate, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo resúmenes"})
		return
	}
	c.JSON(http.StatusOK, summaries)
}

// GetMonthlySummaries obtiene resúmenes mensuales
func (h *OperatorDBHandler) GetMonthlySummaries(c *gin.Context) {
	year, _ := strconv.Atoi(c.Query("year"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "12"))

	summaries, err := h.repo.GetMonthlySummaries(c.Request.Context(), year, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo resúmenes"})
		return
	}
	c.JSON(http.StatusOK, summaries)
}

// GetOperatorPerformanceMetrics obtiene métricas de rendimiento
func (h *OperatorDBHandler) GetOperatorPerformanceMetrics(c *gin.Context) {
	operatorID, _ := strconv.ParseInt(c.Query("operator_id"), 10, 64)
	var startDate, endDate *time.Time
	if s := c.Query("start_date"); s != "" {
		if t, err := time.Parse("2006-01-02", s); err == nil {
			startDate = &t
		}
	}
	if e := c.Query("end_date"); e != "" {
		if t, err := time.Parse("2006-01-02", e); err == nil {
			endDate = &t
		}
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "30"))

	metrics, err := h.repo.GetOperatorPerformanceMetrics(c.Request.Context(), operatorID, startDate, endDate, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo métricas"})
		return
	}
	c.JSON(http.StatusOK, metrics)
}

// GetDataExports obtiene exportaciones de datos
func (h *OperatorDBHandler) GetDataExports(c *gin.Context) {
	operatorID := h.getOperatorID(c)
	exportType := c.Query("export_type")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	exports, err := h.repo.GetDataExports(c.Request.Context(), operatorID, exportType, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo exportaciones"})
		return
	}
	c.JSON(http.StatusOK, exports)
}

// CreateDataExport crea una exportación de datos
func (h *OperatorDBHandler) CreateDataExport(c *gin.Context) {
	var req struct {
		ExportType string `json:"export_type" binding:"required"`
		ExportName string `json:"export_name" binding:"required"`
		Filters    string `json:"filters"`
		FileFormat string `json:"file_format"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.Filters == "" {
		req.Filters = "{}"
	}
	if req.FileFormat == "" {
		req.FileFormat = "csv"
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateDataExport(c.Request.Context(), operatorID, req.ExportType, req.ExportName, req.Filters, req.FileFormat)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando exportación"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Exportación creada"})
}

// GetCustomDashboards obtiene dashboards personalizados
func (h *OperatorDBHandler) GetCustomDashboards(c *gin.Context) {
	operatorID := h.getOperatorID(c)

	dashboards, err := h.repo.GetCustomDashboards(c.Request.Context(), operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo dashboards"})
		return
	}
	c.JSON(http.StatusOK, dashboards)
}

// CreateCustomDashboard crea un dashboard personalizado
func (h *OperatorDBHandler) CreateCustomDashboard(c *gin.Context) {
	var req struct {
		Name        string  `json:"name" binding:"required"`
		Description *string `json:"description"`
		Layout      string  `json:"layout"`
		Widgets     string  `json:"widgets"`
		IsDefault   bool    `json:"is_default"`
		IsShared    bool    `json:"is_shared"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.Layout == "" {
		req.Layout = "{}"
	}
	if req.Widgets == "" {
		req.Widgets = "[]"
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateCustomDashboard(c.Request.Context(), operatorID, req.Name, req.Description, req.Layout, req.Widgets, req.IsDefault, req.IsShared)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando dashboard"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Dashboard creado"})
}

// UpdateCustomDashboard actualiza un dashboard
func (h *OperatorDBHandler) UpdateCustomDashboard(c *gin.Context) {
	dashboardID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Name        string  `json:"name" binding:"required"`
		Description *string `json:"description"`
		Layout      string  `json:"layout"`
		Widgets     string  `json:"widgets"`
		IsDefault   bool    `json:"is_default"`
		IsShared    bool    `json:"is_shared"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.Layout == "" {
		req.Layout = "{}"
	}
	if req.Widgets == "" {
		req.Widgets = "[]"
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.UpdateCustomDashboard(c.Request.Context(), dashboardID, operatorID, req.Name, req.Description, req.Layout, req.Widgets, req.IsDefault, req.IsShared); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando dashboard"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Dashboard actualizado"})
}

// DeleteCustomDashboard elimina un dashboard
func (h *OperatorDBHandler) DeleteCustomDashboard(c *gin.Context) {
	dashboardID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.DeleteCustomDashboard(c.Request.Context(), dashboardID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando dashboard"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Dashboard eliminado"})
}


// ========== PART 8: SECURITY ==========

// GetSecuritySessions obtiene sesiones de seguridad del operador
func (h *OperatorDBHandler) GetSecuritySessions(c *gin.Context) {
	operatorID := h.getOperatorID(c)
	activeOnly := c.Query("active_only") != "false"

	sessions, err := h.repo.GetOperatorSessionsExtended(c.Request.Context(), operatorID, activeOnly)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo sesiones"})
		return
	}
	c.JSON(http.StatusOK, sessions)
}

// TerminateSecuritySession termina una sesión de seguridad
func (h *OperatorDBHandler) TerminateSecuritySession(c *gin.Context) {
	sessionID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.TerminateSessionExtended(c.Request.Context(), sessionID, operatorID, "Terminada manualmente"); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error terminando sesión"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Sesión terminada"})
}

// TerminateAllSecuritySessions termina todas las sesiones de seguridad
func (h *OperatorDBHandler) TerminateAllSecuritySessions(c *gin.Context) {
	var req struct {
		ExceptCurrentID *int64 `json:"except_current_id"`
	}
	c.ShouldBindJSON(&req)

	operatorID := h.getOperatorID(c)
	if err := h.repo.TerminateAllSessionsExtended(c.Request.Context(), operatorID, req.ExceptCurrentID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error terminando sesiones"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Sesiones terminadas"})
}

// GetSecurityLoginHistory obtiene historial de login de seguridad
func (h *OperatorDBHandler) GetSecurityLoginHistory(c *gin.Context) {
	operatorID := h.getOperatorID(c)
	var successOnly *bool
	if s := c.Query("success"); s != "" {
		b := s == "true"
		successOnly = &b
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	history, err := h.repo.GetOperatorLoginHistory(c.Request.Context(), operatorID, successOnly, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo historial"})
		return
	}
	c.JSON(http.StatusOK, history)
}

// GetAPITokens obtiene tokens de API
func (h *OperatorDBHandler) GetAPITokens(c *gin.Context) {
	operatorID := h.getOperatorID(c)

	tokens, err := h.repo.GetAPITokens(c.Request.Context(), operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo tokens"})
		return
	}
	c.JSON(http.StatusOK, tokens)
}

// CreateAPIToken crea un token de API
func (h *OperatorDBHandler) CreateAPIToken(c *gin.Context) {
	var req struct {
		Name        string     `json:"name" binding:"required"`
		Permissions string     `json:"permissions"`
		Scopes      string     `json:"scopes"`
		RateLimit   int        `json:"rate_limit"`
		ExpiresAt   *time.Time `json:"expires_at"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.Permissions == "" {
		req.Permissions = "[]"
	}
	if req.Scopes == "" {
		req.Scopes = "[]"
	}
	if req.RateLimit <= 0 {
		req.RateLimit = 1000
	}

	// Generar token (en producción usar crypto/rand)
	tokenPrefix := fmt.Sprintf("op_%d_", time.Now().Unix())
	tokenHash := fmt.Sprintf("hash_%d_%d", h.getOperatorID(c), time.Now().UnixNano())

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateAPIToken(c.Request.Context(), operatorID, req.Name, tokenHash, tokenPrefix, req.Permissions, req.Scopes, req.RateLimit, req.ExpiresAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando token"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "token_prefix": tokenPrefix, "message": "Token creado"})
}

// RevokeAPIToken revoca un token de API
func (h *OperatorDBHandler) RevokeAPIToken(c *gin.Context) {
	tokenID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.RevokeAPIToken(c.Request.Context(), tokenID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error revocando token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Token revocado"})
}

// GetSecuritySettings obtiene configuración de seguridad
func (h *OperatorDBHandler) GetSecuritySettings(c *gin.Context) {
	operatorID := h.getOperatorID(c)

	settings, err := h.repo.GetSecuritySettings(c.Request.Context(), operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo configuración"})
		return
	}
	c.JSON(http.StatusOK, settings)
}

// UpdateSecuritySettings actualiza configuración de seguridad
func (h *OperatorDBHandler) UpdateSecuritySettings(c *gin.Context) {
	var req struct {
		Require2FAForSensitive   bool   `json:"require_2fa_for_sensitive"`
		SessionTimeoutMinutes    int    `json:"session_timeout_minutes"`
		MaxSessions              int    `json:"max_sessions"`
		IPWhitelist              string `json:"ip_whitelist"`
		LoginNotifications       bool   `json:"login_notifications"`
		SuspiciousActivityAlerts bool   `json:"suspicious_activity_alerts"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.IPWhitelist == "" {
		req.IPWhitelist = "[]"
	}
	if req.SessionTimeoutMinutes <= 0 {
		req.SessionTimeoutMinutes = 480
	}
	if req.MaxSessions <= 0 {
		req.MaxSessions = 5
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.UpdateSecuritySettings(c.Request.Context(), operatorID, req.Require2FAForSensitive, req.SessionTimeoutMinutes, req.MaxSessions, req.IPWhitelist, req.LoginNotifications, req.SuspiciousActivityAlerts); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando configuración"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Configuración actualizada"})
}

// GetIPBlocks obtiene bloqueos de IP
func (h *OperatorDBHandler) GetIPBlocks(c *gin.Context) {
	activeOnly := c.Query("active_only") != "false"
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))

	blocks, err := h.repo.GetIPBlocks(c.Request.Context(), activeOnly, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo bloqueos"})
		return
	}
	c.JSON(http.StatusOK, blocks)
}

// CreateIPBlock crea un bloqueo de IP
func (h *OperatorDBHandler) CreateIPBlock(c *gin.Context) {
	var req struct {
		IPAddress string     `json:"ip_address" binding:"required"`
		IPRange   *string    `json:"ip_range"`
		BlockType string     `json:"block_type"`
		Reason    string     `json:"reason"`
		ExpiresAt *time.Time `json:"expires_at"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.BlockType == "" {
		req.BlockType = "temporary"
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateIPBlock(c.Request.Context(), req.IPAddress, req.IPRange, req.BlockType, req.Reason, operatorID, req.ExpiresAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando bloqueo"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "IP bloqueada"})
}

// RemoveIPBlock remueve un bloqueo de IP
func (h *OperatorDBHandler) RemoveIPBlock(c *gin.Context) {
	blockID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.repo.RemoveIPBlock(c.Request.Context(), blockID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error removiendo bloqueo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Bloqueo removido"})
}

// GetSecurityEvents obtiene eventos de seguridad
func (h *OperatorDBHandler) GetSecurityEvents(c *gin.Context) {
	operatorID, _ := strconv.ParseInt(c.Query("operator_id"), 10, 64)
	eventType := c.Query("event_type")
	severity := c.Query("severity")
	unresolvedOnly := c.Query("unresolved_only") == "true"
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))

	events, err := h.repo.GetSecurityEvents(c.Request.Context(), operatorID, eventType, severity, unresolvedOnly, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo eventos"})
		return
	}
	c.JSON(http.StatusOK, events)
}

// ResolveSecurityEvent resuelve un evento de seguridad
func (h *OperatorDBHandler) ResolveSecurityEvent(c *gin.Context) {
	eventID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Notes string `json:"notes"`
	}
	c.ShouldBindJSON(&req)

	operatorID := h.getOperatorID(c)
	if err := h.repo.ResolveSecurityEvent(c.Request.Context(), eventID, operatorID, req.Notes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error resolviendo evento"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Evento resuelto"})
}

// GetTrustedDevices obtiene dispositivos confiables
func (h *OperatorDBHandler) GetTrustedDevices(c *gin.Context) {
	operatorID := h.getOperatorID(c)

	devices, err := h.repo.GetTrustedDevices(c.Request.Context(), operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo dispositivos"})
		return
	}
	c.JSON(http.StatusOK, devices)
}

// RemoveTrustedDevice remueve un dispositivo confiable
func (h *OperatorDBHandler) RemoveTrustedDevice(c *gin.Context) {
	deviceID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.RemoveTrustedDevice(c.Request.Context(), deviceID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error removiendo dispositivo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Dispositivo removido"})
}

// GetPasswordPolicies obtiene políticas de contraseña
func (h *OperatorDBHandler) GetPasswordPolicies(c *gin.Context) {
	policies, err := h.repo.GetPasswordPolicies(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo políticas"})
		return
	}
	c.JSON(http.StatusOK, policies)
}


// ========== PART 9: NOTIFICATIONS & STATISTICS ==========

// GetOperatorNotifications obtiene notificaciones del operador
func (h *OperatorDBHandler) GetOperatorNotifications(c *gin.Context) {
	operatorID := h.getOperatorID(c)
	unreadOnly := c.Query("unread_only") == "true"
	includeArchived := c.Query("include_archived") == "true"
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	notifications, err := h.repo.GetOperatorNotifications(c.Request.Context(), operatorID, unreadOnly, includeArchived, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo notificaciones"})
		return
	}
	c.JSON(http.StatusOK, notifications)
}

// GetUnreadNotificationCount obtiene conteo de notificaciones no leídas
func (h *OperatorDBHandler) GetUnreadNotificationCount(c *gin.Context) {
	operatorID := h.getOperatorID(c)

	count, err := h.repo.GetUnreadNotificationCount(c.Request.Context(), operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo conteo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"count": count})
}

// MarkNotificationRead marca una notificación como leída
func (h *OperatorDBHandler) MarkNotificationRead(c *gin.Context) {
	notificationID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.MarkNotificationRead(c.Request.Context(), notificationID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error marcando notificación"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Notificación marcada como leída"})
}

// MarkAllNotificationsRead marca todas las notificaciones como leídas
func (h *OperatorDBHandler) MarkAllNotificationsRead(c *gin.Context) {
	operatorID := h.getOperatorID(c)

	if err := h.repo.MarkAllNotificationsRead(c.Request.Context(), operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error marcando notificaciones"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Todas las notificaciones marcadas como leídas"})
}

// ArchiveNotification archiva una notificación
func (h *OperatorDBHandler) ArchiveNotification(c *gin.Context) {
	notificationID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.ArchiveNotification(c.Request.Context(), notificationID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error archivando notificación"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Notificación archivada"})
}

// DeleteNotification elimina una notificación
func (h *OperatorDBHandler) DeleteNotification(c *gin.Context) {
	notificationID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.DeleteNotification(c.Request.Context(), notificationID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando notificación"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Notificación eliminada"})
}

// GetNotificationPreferences obtiene preferencias de notificación
func (h *OperatorDBHandler) GetNotificationPreferences(c *gin.Context) {
	operatorID := h.getOperatorID(c)

	prefs, err := h.repo.GetNotificationPreferences(c.Request.Context(), operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo preferencias"})
		return
	}
	c.JSON(http.StatusOK, prefs)
}

// UpdateNotificationPreferences actualiza preferencias de notificación
func (h *OperatorDBHandler) UpdateNotificationPreferences(c *gin.Context) {
	var req struct {
		EmailEnabled        bool   `json:"email_enabled"`
		PushEnabled         bool   `json:"push_enabled"`
		SoundEnabled        bool   `json:"sound_enabled"`
		DesktopEnabled      bool   `json:"desktop_enabled"`
		AlertNotifications  bool   `json:"alert_notifications"`
		TradeNotifications  bool   `json:"trade_notifications"`
		UserNotifications   bool   `json:"user_notifications"`
		SystemNotifications bool   `json:"system_notifications"`
		ChatNotifications   bool   `json:"chat_notifications"`
		ReportNotifications bool   `json:"report_notifications"`
		QuietHoursEnabled   bool   `json:"quiet_hours_enabled"`
		DigestEnabled       bool   `json:"digest_enabled"`
		DigestFrequency     string `json:"digest_frequency"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.DigestFrequency == "" {
		req.DigestFrequency = "daily"
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.UpdateNotificationPreferences(c.Request.Context(), operatorID, req.EmailEnabled, req.PushEnabled, req.SoundEnabled, req.DesktopEnabled, req.AlertNotifications, req.TradeNotifications, req.UserNotifications, req.SystemNotifications, req.ChatNotifications, req.ReportNotifications, req.QuietHoursEnabled, req.DigestEnabled, req.DigestFrequency); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando preferencias"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Preferencias actualizadas"})
}

// GetPlatformStats obtiene estadísticas de la plataforma
func (h *OperatorDBHandler) GetPlatformStats(c *gin.Context) {
	var startDate, endDate *time.Time
	if s := c.Query("start_date"); s != "" {
		if t, err := time.Parse("2006-01-02", s); err == nil {
			startDate = &t
		}
	}
	if e := c.Query("end_date"); e != "" {
		if t, err := time.Parse("2006-01-02", e); err == nil {
			endDate = &t
		}
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "30"))

	stats, err := h.repo.GetPlatformStats(c.Request.Context(), startDate, endDate, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estadísticas"})
		return
	}
	c.JSON(http.StatusOK, stats)
}

// GetKPIs obtiene KPIs
func (h *OperatorDBHandler) GetKPIs(c *gin.Context) {
	category := c.Query("category")
	periodType := c.Query("period_type")

	kpis, err := h.repo.GetKPIs(c.Request.Context(), category, periodType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo KPIs"})
		return
	}
	c.JSON(http.StatusOK, kpis)
}

// GetAssetStats obtiene estadísticas por activo
func (h *OperatorDBHandler) GetAssetStats(c *gin.Context) {
	symbol := c.Query("symbol")
	var startDate, endDate *time.Time
	if s := c.Query("start_date"); s != "" {
		if t, err := time.Parse("2006-01-02", s); err == nil {
			startDate = &t
		}
	}
	if e := c.Query("end_date"); e != "" {
		if t, err := time.Parse("2006-01-02", e); err == nil {
			endDate = &t
		}
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	stats, err := h.repo.GetAssetStats(c.Request.Context(), symbol, startDate, endDate, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estadísticas"})
		return
	}
	c.JSON(http.StatusOK, stats)
}

// GetTradingStatsAggregate obtiene estadísticas de trading agregadas
func (h *OperatorDBHandler) GetTradingStatsAggregate(c *gin.Context) {
	var startDate, endDate *time.Time
	if s := c.Query("start_date"); s != "" {
		if t, err := time.Parse("2006-01-02", s); err == nil {
			startDate = &t
		}
	}
	if e := c.Query("end_date"); e != "" {
		if t, err := time.Parse("2006-01-02", e); err == nil {
			endDate = &t
		}
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "30"))

	stats, err := h.repo.GetTradingStatsAggregate(c.Request.Context(), startDate, endDate, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estadísticas"})
		return
	}
	c.JSON(http.StatusOK, stats)
}

// GetFinancialStatsAggregate obtiene estadísticas financieras agregadas
func (h *OperatorDBHandler) GetFinancialStatsAggregate(c *gin.Context) {
	var startDate, endDate *time.Time
	if s := c.Query("start_date"); s != "" {
		if t, err := time.Parse("2006-01-02", s); err == nil {
			startDate = &t
		}
	}
	if e := c.Query("end_date"); e != "" {
		if t, err := time.Parse("2006-01-02", e); err == nil {
			endDate = &t
		}
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "30"))

	stats, err := h.repo.GetFinancialStatsAggregate(c.Request.Context(), startDate, endDate, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estadísticas"})
		return
	}
	c.JSON(http.StatusOK, stats)
}


// ========== PART 10: FINAL FEATURES ==========

// GetSearchHistory obtiene historial de búsqueda
func (h *OperatorDBHandler) GetSearchHistory(c *gin.Context) {
	operatorID := h.getOperatorID(c)
	searchType := c.Query("search_type")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	history, err := h.repo.GetSearchHistory(c.Request.Context(), operatorID, searchType, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo historial"})
		return
	}
	c.JSON(http.StatusOK, history)
}

// SaveSearchHistory guarda una búsqueda
func (h *OperatorDBHandler) SaveSearchHistory(c *gin.Context) {
	var req struct {
		SearchQuery  string `json:"search_query" binding:"required"`
		SearchType   string `json:"search_type"`
		ResultsCount int    `json:"results_count"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.SearchType == "" {
		req.SearchType = "global"
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.SaveSearchHistory(c.Request.Context(), operatorID, req.SearchQuery, req.SearchType, req.ResultsCount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error guardando búsqueda"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id})
}

// ClearSearchHistory limpia el historial de búsqueda
func (h *OperatorDBHandler) ClearSearchHistory(c *gin.Context) {
	operatorID := h.getOperatorID(c)

	if err := h.repo.ClearSearchHistory(c.Request.Context(), operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error limpiando historial"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Historial limpiado"})
}

// GetQuickAccess obtiene accesos rápidos
func (h *OperatorDBHandler) GetQuickAccess(c *gin.Context) {
	operatorID := h.getOperatorID(c)

	items, err := h.repo.GetQuickAccess(c.Request.Context(), operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo accesos"})
		return
	}
	c.JSON(http.StatusOK, items)
}

// AddQuickAccess agrega un acceso rápido
func (h *OperatorDBHandler) AddQuickAccess(c *gin.Context) {
	var req struct {
		ItemType string  `json:"item_type" binding:"required"`
		ItemID   *int64  `json:"item_id"`
		ItemName string  `json:"item_name" binding:"required"`
		ItemURL  *string `json:"item_url"`
		Icon     *string `json:"icon"`
		Color    *string `json:"color"`
		IsPinned bool    `json:"is_pinned"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.AddQuickAccess(c.Request.Context(), operatorID, req.ItemType, req.ItemID, req.ItemName, req.ItemURL, req.Icon, req.Color, req.IsPinned)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error agregando acceso"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Acceso agregado"})
}

// RemoveQuickAccess remueve un acceso rápido
func (h *OperatorDBHandler) RemoveQuickAccess(c *gin.Context) {
	quickAccessID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.RemoveQuickAccess(c.Request.Context(), quickAccessID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error removiendo acceso"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Acceso removido"})
}

// ToggleQuickAccessPin alterna el pin de un acceso
func (h *OperatorDBHandler) ToggleQuickAccessPin(c *gin.Context) {
	quickAccessID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.ToggleQuickAccessPin(c.Request.Context(), quickAccessID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando acceso"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Pin actualizado"})
}

// GetWebhooks obtiene webhooks
func (h *OperatorDBHandler) GetWebhooks(c *gin.Context) {
	operatorID := h.getOperatorID(c)
	activeOnly := c.Query("active_only") == "true"

	webhooks, err := h.repo.GetWebhooks(c.Request.Context(), operatorID, activeOnly)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo webhooks"})
		return
	}
	c.JSON(http.StatusOK, webhooks)
}

// CreateWebhook crea un webhook
func (h *OperatorDBHandler) CreateWebhook(c *gin.Context) {
	var req struct {
		Name           string `json:"name" binding:"required"`
		URL            string `json:"url" binding:"required"`
		Secret         string `json:"secret"`
		Events         string `json:"events"`
		RetryCount     int    `json:"retry_count"`
		TimeoutSeconds int    `json:"timeout_seconds"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.Events == "" {
		req.Events = "[]"
	}
	if req.RetryCount <= 0 {
		req.RetryCount = 3
	}
	if req.TimeoutSeconds <= 0 {
		req.TimeoutSeconds = 30
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateWebhook(c.Request.Context(), operatorID, req.Name, req.URL, req.Secret, req.Events, req.RetryCount, req.TimeoutSeconds)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando webhook"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Webhook creado"})
}

// UpdateWebhook actualiza un webhook
func (h *OperatorDBHandler) UpdateWebhook(c *gin.Context) {
	webhookID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Name           string `json:"name" binding:"required"`
		URL            string `json:"url" binding:"required"`
		Events         string `json:"events"`
		IsActive       bool   `json:"is_active"`
		RetryCount     int    `json:"retry_count"`
		TimeoutSeconds int    `json:"timeout_seconds"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.Events == "" {
		req.Events = "[]"
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.UpdateWebhook(c.Request.Context(), webhookID, operatorID, req.Name, req.URL, req.Events, req.IsActive, req.RetryCount, req.TimeoutSeconds); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando webhook"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Webhook actualizado"})
}

// DeleteWebhook elimina un webhook
func (h *OperatorDBHandler) DeleteWebhook(c *gin.Context) {
	webhookID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.DeleteWebhook(c.Request.Context(), webhookID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando webhook"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Webhook eliminado"})
}

// GetQuickNotes obtiene notas rápidas
func (h *OperatorDBHandler) GetQuickNotes(c *gin.Context) {
	operatorID := h.getOperatorID(c)

	notes, err := h.repo.GetQuickNotes(c.Request.Context(), operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo notas"})
		return
	}
	c.JSON(http.StatusOK, notes)
}

// CreateQuickNote crea una nota rápida
func (h *OperatorDBHandler) CreateQuickNote(c *gin.Context) {
	var req struct {
		Title      *string    `json:"title"`
		Content    string     `json:"content" binding:"required"`
		Color      string     `json:"color"`
		IsPinned   bool       `json:"is_pinned"`
		ReminderAt *time.Time `json:"reminder_at"`
		Tags       string     `json:"tags"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.Color == "" {
		req.Color = "yellow"
	}
	if req.Tags == "" {
		req.Tags = "[]"
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateQuickNote(c.Request.Context(), operatorID, req.Title, req.Content, req.Color, req.IsPinned, req.ReminderAt, req.Tags)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando nota"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Nota creada"})
}

// UpdateQuickNote actualiza una nota rápida
func (h *OperatorDBHandler) UpdateQuickNote(c *gin.Context) {
	noteID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Title      *string    `json:"title"`
		Content    string     `json:"content" binding:"required"`
		Color      string     `json:"color"`
		IsPinned   bool       `json:"is_pinned"`
		ReminderAt *time.Time `json:"reminder_at"`
		Tags       string     `json:"tags"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.Color == "" {
		req.Color = "yellow"
	}
	if req.Tags == "" {
		req.Tags = "[]"
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.UpdateQuickNote(c.Request.Context(), noteID, operatorID, req.Title, req.Content, req.Color, req.IsPinned, req.ReminderAt, req.Tags); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando nota"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Nota actualizada"})
}

// DeleteQuickNote elimina una nota rápida
func (h *OperatorDBHandler) DeleteQuickNote(c *gin.Context) {
	noteID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.DeleteQuickNote(c.Request.Context(), noteID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando nota"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Nota eliminada"})
}

// GetOperatorTasks obtiene tareas del operador
func (h *OperatorDBHandler) GetOperatorTasks(c *gin.Context) {
	operatorID := h.getOperatorID(c)
	status := c.Query("status")
	priority := c.Query("priority")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	tasks, err := h.repo.GetOperatorTasks(c.Request.Context(), operatorID, status, priority, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo tareas"})
		return
	}
	c.JSON(http.StatusOK, tasks)
}

// CreateOperatorTask crea una tarea
func (h *OperatorDBHandler) CreateOperatorTask(c *gin.Context) {
	var req struct {
		Title       string     `json:"title" binding:"required"`
		Description *string    `json:"description"`
		Priority    string     `json:"priority"`
		DueDate     *time.Time `json:"due_date"`
		RelatedType *string    `json:"related_type"`
		RelatedID   *int64     `json:"related_id"`
		Tags        string     `json:"tags"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.Priority == "" {
		req.Priority = "normal"
	}
	if req.Tags == "" {
		req.Tags = "[]"
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateOperatorTask(c.Request.Context(), operatorID, req.Title, req.Description, req.Priority, req.DueDate, req.RelatedType, req.RelatedID, req.Tags)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando tarea"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Tarea creada"})
}

// UpdateOperatorTaskStatus actualiza el estado de una tarea
func (h *OperatorDBHandler) UpdateOperatorTaskStatus(c *gin.Context) {
	taskID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.UpdateOperatorTaskStatus(c.Request.Context(), taskID, operatorID, req.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando tarea"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Tarea actualizada"})
}

// DeleteOperatorTask elimina una tarea
func (h *OperatorDBHandler) DeleteOperatorTask(c *gin.Context) {
	taskID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.DeleteOperatorTask(c.Request.Context(), taskID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando tarea"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Tarea eliminada"})
}

// GetKeyboardShortcuts obtiene atajos de teclado
func (h *OperatorDBHandler) GetKeyboardShortcuts(c *gin.Context) {
	operatorID := h.getOperatorID(c)

	shortcuts, err := h.repo.GetKeyboardShortcuts(c.Request.Context(), operatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo atajos"})
		return
	}
	c.JSON(http.StatusOK, shortcuts)
}

// UpdateKeyboardShortcut actualiza un atajo de teclado
func (h *OperatorDBHandler) UpdateKeyboardShortcut(c *gin.Context) {
	var req struct {
		Action   string `json:"action" binding:"required"`
		Shortcut string `json:"shortcut" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.UpdateKeyboardShortcut(c.Request.Context(), operatorID, req.Action, req.Shortcut); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando atajo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Atajo actualizado"})
}

// GetQuickResponses obtiene respuestas rápidas
func (h *OperatorDBHandler) GetQuickResponses(c *gin.Context) {
	operatorID := h.getOperatorID(c)
	category := c.Query("category")

	responses, err := h.repo.GetQuickResponses(c.Request.Context(), operatorID, category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo respuestas"})
		return
	}
	c.JSON(http.StatusOK, responses)
}

// CreateQuickResponse crea una respuesta rápida
func (h *OperatorDBHandler) CreateQuickResponse(c *gin.Context) {
	var req struct {
		Name      string  `json:"name" binding:"required"`
		Shortcut  *string `json:"shortcut"`
		Content   string  `json:"content" binding:"required"`
		Category  *string `json:"category"`
		Variables string  `json:"variables"`
		IsGlobal  bool    `json:"is_global"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.Variables == "" {
		req.Variables = "[]"
	}

	operatorID := h.getOperatorID(c)
	id, err := h.repo.CreateQuickResponse(c.Request.Context(), operatorID, req.Name, req.Shortcut, req.Content, req.Category, req.Variables, req.IsGlobal)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando respuesta"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Respuesta creada"})
}

// DeleteQuickResponse elimina una respuesta rápida
func (h *OperatorDBHandler) DeleteQuickResponse(c *gin.Context) {
	responseID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	operatorID := h.getOperatorID(c)
	if err := h.repo.DeleteQuickResponse(c.Request.Context(), responseID, operatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando respuesta"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Respuesta eliminada"})
}
