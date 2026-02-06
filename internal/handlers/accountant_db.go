package handlers

import (
	"net/http"
	"strconv"
	"time"

	"tormentus/internal/repositories"

	"github.com/gin-gonic/gin"
)

// AccountantDBHandler maneja las peticiones del contador
type AccountantDBHandler struct {
	repo *repositories.AccountantRepository
}

// NewAccountantDBHandler crea un nuevo handler
func NewAccountantDBHandler(repo *repositories.AccountantRepository) *AccountantDBHandler {
	return &AccountantDBHandler{repo: repo}
}

// getAccountantID obtiene el ID del contador del contexto
func (h *AccountantDBHandler) getAccountantID(c *gin.Context) int64 {
	if id, exists := c.Get("user_id"); exists {
		return id.(int64)
	}
	return 0
}

// ========== DASHBOARD ==========

// GetDashboardStats obtiene estadísticas del dashboard
func (h *AccountantDBHandler) GetDashboardStats(c *gin.Context) {
	stats, err := h.repo.GetDashboardStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estadísticas"})
		return
	}
	c.JSON(http.StatusOK, stats)
}

// ========== WITHDRAWALS ==========

// GetWithdrawals obtiene solicitudes de retiro
func (h *AccountantDBHandler) GetWithdrawals(c *gin.Context) {
	status := c.Query("status")
	priority := c.Query("priority")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	withdrawals, err := h.repo.GetWithdrawals(c.Request.Context(), status, priority, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo retiros"})
		return
	}
	c.JSON(http.StatusOK, withdrawals)
}

// GetWithdrawalByID obtiene un retiro por ID
func (h *AccountantDBHandler) GetWithdrawalByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	withdrawal, err := h.repo.GetWithdrawalByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Retiro no encontrado"})
		return
	}
	c.JSON(http.StatusOK, withdrawal)
}

// ApproveWithdrawal aprueba un retiro
func (h *AccountantDBHandler) ApproveWithdrawal(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		TxHash string `json:"tx_hash"`
		Notes  string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	accountantID := h.getAccountantID(c)
	if err := h.repo.ApproveWithdrawal(c.Request.Context(), id, accountantID, req.TxHash, req.Notes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error aprobando retiro"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Retiro aprobado"})
}

// RejectWithdrawal rechaza un retiro
func (h *AccountantDBHandler) RejectWithdrawal(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
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

	accountantID := h.getAccountantID(c)
	if err := h.repo.RejectWithdrawal(c.Request.Context(), id, accountantID, req.Reason); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error rechazando retiro"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Retiro rechazado"})
}

// ========== DEPOSITS ==========

// GetDeposits obtiene solicitudes de depósito
func (h *AccountantDBHandler) GetDeposits(c *gin.Context) {
	status := c.Query("status")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	deposits, err := h.repo.GetDeposits(c.Request.Context(), status, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo depósitos"})
		return
	}
	c.JSON(http.StatusOK, deposits)
}

// ConfirmDeposit confirma un depósito
func (h *AccountantDBHandler) ConfirmDeposit(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		CreditedAmount float64 `json:"credited_amount"`
		Notes          string  `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	accountantID := h.getAccountantID(c)
	if err := h.repo.ConfirmDeposit(c.Request.Context(), id, accountantID, req.CreditedAmount, req.Notes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error confirmando depósito"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Depósito confirmado"})
}

// RejectDeposit rechaza un depósito
func (h *AccountantDBHandler) RejectDeposit(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
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

	accountantID := h.getAccountantID(c)
	if err := h.repo.RejectDeposit(c.Request.Context(), id, accountantID, req.Reason); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error rechazando depósito"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Depósito rechazado"})
}

// ========== TOURNAMENT PRIZES ==========

// GetTournamentPrizes obtiene premios de torneos
func (h *AccountantDBHandler) GetTournamentPrizes(c *gin.Context) {
	status := c.Query("status")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	prizes, err := h.repo.GetTournamentPrizes(c.Request.Context(), status, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo premios"})
		return
	}
	c.JSON(http.StatusOK, prizes)
}

// PayPrize paga un premio
func (h *AccountantDBHandler) PayPrize(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		PaymentMethod string `json:"payment_method" binding:"required"`
		TxReference   string `json:"tx_reference"`
		Notes         string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Método de pago requerido"})
		return
	}

	accountantID := h.getAccountantID(c)
	if err := h.repo.PayPrize(c.Request.Context(), id, accountantID, req.PaymentMethod, req.TxReference, req.Notes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error pagando premio"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Premio pagado"})
}


// ========== USER FINANCIAL PROFILES ==========

// GetUserFinancialProfiles obtiene perfiles financieros
func (h *AccountantDBHandler) GetUserFinancialProfiles(c *gin.Context) {
	search := c.Query("search")
	riskLevel := c.Query("risk_level")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	profiles, err := h.repo.GetUserFinancialProfiles(c.Request.Context(), search, riskLevel, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo perfiles"})
		return
	}
	c.JSON(http.StatusOK, profiles)
}

// AdjustUserBalance ajusta el balance de un usuario
func (h *AccountantDBHandler) AdjustUserBalance(c *gin.Context) {
	userID, err := strconv.ParseInt(c.Param("userId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
		return
	}

	var req struct {
		AdjustmentType string  `json:"adjustment_type" binding:"required"`
		Amount         float64 `json:"amount" binding:"required"`
		Reason         string  `json:"reason" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	accountantID := h.getAccountantID(c)
	if err := h.repo.AdjustUserBalance(c.Request.Context(), userID, accountantID, req.AdjustmentType, req.Amount, req.Reason); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error ajustando balance"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Balance ajustado"})
}

// ========== COMMISSIONS ==========

// GetCommissions obtiene comisiones
func (h *AccountantDBHandler) GetCommissions(c *gin.Context) {
	sourceType := c.Query("source_type")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	commissions, err := h.repo.GetCommissions(c.Request.Context(), sourceType, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo comisiones"})
		return
	}
	c.JSON(http.StatusOK, commissions)
}

// GetCommissionTypes obtiene tipos de comisión
func (h *AccountantDBHandler) GetCommissionTypes(c *gin.Context) {
	types, err := h.repo.GetCommissionTypes(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo tipos de comisión"})
		return
	}
	c.JSON(http.StatusOK, types)
}

// ========== INVOICES ==========

// GetInvoices obtiene facturas
func (h *AccountantDBHandler) GetInvoices(c *gin.Context) {
	status := c.Query("status")
	invoiceType := c.Query("type")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	invoices, err := h.repo.GetInvoices(c.Request.Context(), status, invoiceType, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo facturas"})
		return
	}
	c.JSON(http.StatusOK, invoices)
}

// CreateInvoice crea una factura
func (h *AccountantDBHandler) CreateInvoice(c *gin.Context) {
	var req struct {
		InvoiceNumber string    `json:"invoice_number" binding:"required"`
		InvoiceType   string    `json:"invoice_type"`
		ClientName    string    `json:"client_name" binding:"required"`
		ClientEmail   string    `json:"client_email"`
		ClientTaxID   string    `json:"client_tax_id"`
		Amount        float64   `json:"amount" binding:"required"`
		TaxAmount     float64   `json:"tax_amount"`
		TotalAmount   float64   `json:"total_amount" binding:"required"`
		Currency      string    `json:"currency"`
		Description   string    `json:"description"`
		IssueDate     time.Time `json:"issue_date" binding:"required"`
		DueDate       time.Time `json:"due_date" binding:"required"`
		Notes         string    `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	accountantID := h.getAccountantID(c)
	inv := &repositories.Invoice{
		InvoiceNumber: req.InvoiceNumber,
		InvoiceType:   req.InvoiceType,
		ClientName:    req.ClientName,
		ClientEmail:   req.ClientEmail,
		ClientTaxID:   req.ClientTaxID,
		Amount:        req.Amount,
		TaxAmount:     req.TaxAmount,
		TotalAmount:   req.TotalAmount,
		Currency:      req.Currency,
		Description:   req.Description,
		IssueDate:     req.IssueDate,
		DueDate:       req.DueDate,
		Notes:         req.Notes,
		CreatedBy:     accountantID,
	}

	id, err := h.repo.CreateInvoice(c.Request.Context(), inv)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando factura"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Factura creada"})
}

// MarkInvoicePaid marca factura como pagada
func (h *AccountantDBHandler) MarkInvoicePaid(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		PaymentMethod    string `json:"payment_method" binding:"required"`
		PaymentReference string `json:"payment_reference"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Método de pago requerido"})
		return
	}

	accountantID := h.getAccountantID(c)
	if err := h.repo.MarkInvoicePaid(c.Request.Context(), id, accountantID, req.PaymentMethod, req.PaymentReference); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error marcando factura como pagada"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Factura marcada como pagada"})
}

// ========== VENDORS ==========

// GetVendors obtiene proveedores
func (h *AccountantDBHandler) GetVendors(c *gin.Context) {
	search := c.Query("search")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	vendors, err := h.repo.GetVendors(c.Request.Context(), search, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo proveedores"})
		return
	}
	c.JSON(http.StatusOK, vendors)
}

// CreateVendor crea un proveedor
func (h *AccountantDBHandler) CreateVendor(c *gin.Context) {
	var req struct {
		Name                   string `json:"name" binding:"required"`
		Code                   string `json:"code"`
		TaxID                  string `json:"tax_id"`
		Email                  string `json:"email"`
		Phone                  string `json:"phone"`
		Address                string `json:"address"`
		Country                string `json:"country"`
		Category               string `json:"category"`
		PaymentTerms           int    `json:"payment_terms"`
		PreferredPaymentMethod string `json:"preferred_payment_method"`
		ContactPerson          string `json:"contact_person"`
		Notes                  string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nombre requerido"})
		return
	}

	v := &repositories.Vendor{
		Name:                   req.Name,
		Code:                   req.Code,
		TaxID:                  req.TaxID,
		Email:                  req.Email,
		Phone:                  req.Phone,
		Address:                req.Address,
		Country:                req.Country,
		Category:               req.Category,
		PaymentTerms:           req.PaymentTerms,
		PreferredPaymentMethod: req.PreferredPaymentMethod,
		ContactPerson:          req.ContactPerson,
		Notes:                  req.Notes,
	}

	id, err := h.repo.CreateVendor(c.Request.Context(), v)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando proveedor"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Proveedor creado"})
}

// ========== BANK ACCOUNTS ==========

// GetBankAccounts obtiene cuentas bancarias
func (h *AccountantDBHandler) GetBankAccounts(c *gin.Context) {
	accounts, err := h.repo.GetBankAccounts(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo cuentas bancarias"})
		return
	}
	c.JSON(http.StatusOK, accounts)
}

// ========== RECONCILIATIONS ==========

// GetReconciliations obtiene conciliaciones
func (h *AccountantDBHandler) GetReconciliations(c *gin.Context) {
	status := c.Query("status")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	reconciliations, err := h.repo.GetReconciliations(c.Request.Context(), status, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo conciliaciones"})
		return
	}
	c.JSON(http.StatusOK, reconciliations)
}

// CreateReconciliation crea una conciliación
func (h *AccountantDBHandler) CreateReconciliation(c *gin.Context) {
	var req struct {
		ReconciliationDate time.Time  `json:"reconciliation_date" binding:"required"`
		PeriodStart        *time.Time `json:"period_start"`
		PeriodEnd          *time.Time `json:"period_end"`
		ExpectedBalance    float64    `json:"expected_balance" binding:"required"`
		ActualBalance      float64    `json:"actual_balance" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	rec := &repositories.Reconciliation{
		ReconciliationDate: req.ReconciliationDate,
		PeriodStart:        req.PeriodStart,
		PeriodEnd:          req.PeriodEnd,
		ExpectedBalance:    req.ExpectedBalance,
		ActualBalance:      req.ActualBalance,
		Difference:         req.ExpectedBalance - req.ActualBalance,
	}

	id, err := h.repo.CreateReconciliation(c.Request.Context(), rec)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando conciliación"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Conciliación creada"})
}

// ResolveReconciliation resuelve una conciliación
func (h *AccountantDBHandler) ResolveReconciliation(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Notes string `json:"notes"`
	}
	c.ShouldBindJSON(&req)

	accountantID := h.getAccountantID(c)
	if err := h.repo.ResolveReconciliation(c.Request.Context(), id, accountantID, req.Notes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error resolviendo conciliación"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Conciliación resuelta"})
}


// ========== FINANCIAL REPORTS ==========

// GetFinancialReports obtiene reportes financieros
func (h *AccountantDBHandler) GetFinancialReports(c *gin.Context) {
	reportType := c.Query("report_type")
	periodType := c.Query("period_type")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	reports, err := h.repo.GetFinancialReports(c.Request.Context(), reportType, periodType, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo reportes"})
		return
	}
	c.JSON(http.StatusOK, reports)
}

// GenerateFinancialReport genera un reporte financiero
func (h *AccountantDBHandler) GenerateFinancialReport(c *gin.Context) {
	var req struct {
		ReportType  string    `json:"report_type" binding:"required"`
		ReportName  string    `json:"report_name" binding:"required"`
		PeriodType  string    `json:"period_type" binding:"required"`
		PeriodStart time.Time `json:"period_start" binding:"required"`
		PeriodEnd   time.Time `json:"period_end" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	accountantID := h.getAccountantID(c)
	id, err := h.repo.GenerateFinancialReport(c.Request.Context(), req.ReportType, req.ReportName, req.PeriodType, req.PeriodStart, req.PeriodEnd, accountantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generando reporte"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Reporte generado"})
}

// ========== DAILY/MONTHLY SUMMARIES ==========

// GetDailySummaries obtiene resúmenes diarios
func (h *AccountantDBHandler) GetDailySummaries(c *gin.Context) {
	startDateStr := c.DefaultQuery("start_date", time.Now().AddDate(0, 0, -30).Format("2006-01-02"))
	endDateStr := c.DefaultQuery("end_date", time.Now().Format("2006-01-02"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "30"))

	startDate, _ := time.Parse("2006-01-02", startDateStr)
	endDate, _ := time.Parse("2006-01-02", endDateStr)

	summaries, err := h.repo.GetDailySummaries(c.Request.Context(), startDate, endDate, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo resúmenes diarios"})
		return
	}
	c.JSON(http.StatusOK, summaries)
}

// GetMonthlySummaries obtiene resúmenes mensuales
func (h *AccountantDBHandler) GetMonthlySummaries(c *gin.Context) {
	year, _ := strconv.Atoi(c.DefaultQuery("year", strconv.Itoa(time.Now().Year())))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "12"))

	summaries, err := h.repo.GetMonthlySummaries(c.Request.Context(), year, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo resúmenes mensuales"})
		return
	}
	c.JSON(http.StatusOK, summaries)
}

// ========== AUDIT LOGS ==========

// GetAuditLogs obtiene logs de auditoría
func (h *AccountantDBHandler) GetAuditLogs(c *gin.Context) {
	actionType := c.Query("action_type")
	riskLevel := c.Query("risk_level")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))

	logs, err := h.repo.GetAuditLogs(c.Request.Context(), actionType, riskLevel, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo logs de auditoría"})
		return
	}
	c.JSON(http.StatusOK, logs)
}

// ========== SUSPICIOUS ALERTS ==========

// GetSuspiciousAlerts obtiene alertas sospechosas
func (h *AccountantDBHandler) GetSuspiciousAlerts(c *gin.Context) {
	status := c.Query("status")
	severity := c.Query("severity")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	alerts, err := h.repo.GetSuspiciousAlerts(c.Request.Context(), status, severity, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo alertas"})
		return
	}
	c.JSON(http.StatusOK, alerts)
}

// ReviewAlert revisa una alerta
func (h *AccountantDBHandler) ReviewAlert(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Notes       string `json:"notes"`
		ActionTaken string `json:"action_taken"`
	}
	c.ShouldBindJSON(&req)

	accountantID := h.getAccountantID(c)
	if err := h.repo.ReviewAlert(c.Request.Context(), id, accountantID, req.Notes, req.ActionTaken); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error revisando alerta"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Alerta revisada"})
}

// EscalateAlert escala una alerta
func (h *AccountantDBHandler) EscalateAlert(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
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

	if err := h.repo.EscalateAlert(c.Request.Context(), id, req.EscalateTo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error escalando alerta"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Alerta escalada"})
}

// ========== FRAUD INVESTIGATIONS ==========

// GetFraudInvestigations obtiene investigaciones de fraude
func (h *AccountantDBHandler) GetFraudInvestigations(c *gin.Context) {
	status := c.Query("status")
	priority := c.Query("priority")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	investigations, err := h.repo.GetFraudInvestigations(c.Request.Context(), status, priority, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo investigaciones"})
		return
	}
	c.JSON(http.StatusOK, investigations)
}

// CreateFraudInvestigation crea una investigación de fraude
func (h *AccountantDBHandler) CreateFraudInvestigation(c *gin.Context) {
	var req struct {
		UserID            int64  `json:"user_id" binding:"required"`
		CaseNumber        string `json:"case_number" binding:"required"`
		InvestigationType string `json:"investigation_type"`
		Priority          string `json:"priority"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	accountantID := h.getAccountantID(c)
	id, err := h.repo.CreateFraudInvestigation(c.Request.Context(), req.UserID, req.CaseNumber, req.InvestigationType, req.Priority, accountantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando investigación"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Investigación creada"})
}

// CloseFraudInvestigation cierra una investigación
func (h *AccountantDBHandler) CloseFraudInvestigation(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Findings    string `json:"findings"`
		Conclusion  string `json:"conclusion"`
		ActionTaken string `json:"action_taken"`
	}
	c.ShouldBindJSON(&req)

	accountantID := h.getAccountantID(c)
	if err := h.repo.CloseFraudInvestigation(c.Request.Context(), id, accountantID, req.Findings, req.Conclusion, req.ActionTaken); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error cerrando investigación"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Investigación cerrada"})
}

// ========== ACCOUNTANT SETTINGS ==========

// GetAccountantSettings obtiene configuración del contador
func (h *AccountantDBHandler) GetAccountantSettings(c *gin.Context) {
	accountantID := h.getAccountantID(c)
	settings, err := h.repo.GetAccountantSettings(c.Request.Context(), accountantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo configuración"})
		return
	}
	c.JSON(http.StatusOK, settings)
}

// UpdateAccountantSettings actualiza configuración
func (h *AccountantDBHandler) UpdateAccountantSettings(c *gin.Context) {
	var req struct {
		Timezone         string `json:"timezone"`
		Language         string `json:"language"`
		DateFormat       string `json:"date_format"`
		CurrencyFormat   string `json:"currency_format"`
		Theme            string `json:"theme"`
		SidebarCollapsed bool   `json:"sidebar_collapsed"`
		DefaultView      string `json:"default_view"`
		ItemsPerPage     int    `json:"items_per_page"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	accountantID := h.getAccountantID(c)
	settings := &repositories.AccountantSettings{
		Timezone:         req.Timezone,
		Language:         req.Language,
		DateFormat:       req.DateFormat,
		CurrencyFormat:   req.CurrencyFormat,
		Theme:            req.Theme,
		SidebarCollapsed: req.SidebarCollapsed,
		DefaultView:      req.DefaultView,
		ItemsPerPage:     req.ItemsPerPage,
	}

	if err := h.repo.UpdateAccountantSettings(c.Request.Context(), accountantID, settings); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando configuración"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Configuración actualizada"})
}

// ========== ACCOUNTANT NOTIFICATIONS ==========

// GetAccountantNotifications obtiene notificaciones
func (h *AccountantDBHandler) GetAccountantNotifications(c *gin.Context) {
	unreadOnly := c.Query("unread_only") == "true"
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	accountantID := h.getAccountantID(c)
	notifications, err := h.repo.GetAccountantNotifications(c.Request.Context(), accountantID, unreadOnly, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo notificaciones"})
		return
	}
	c.JSON(http.StatusOK, notifications)
}

// MarkAccountantNotificationRead marca notificación como leída
func (h *AccountantDBHandler) MarkAccountantNotificationRead(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	accountantID := h.getAccountantID(c)
	if err := h.repo.MarkAccountantNotificationRead(c.Request.Context(), id, accountantID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error marcando notificación"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Notificación marcada como leída"})
}

// GetUnreadNotificationCount obtiene conteo de no leídas
func (h *AccountantDBHandler) GetUnreadNotificationCount(c *gin.Context) {
	accountantID := h.getAccountantID(c)
	count, err := h.repo.GetUnreadNotificationCount(c.Request.Context(), accountantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo conteo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"count": count})
}


// ========== PLATFORM METRICS ==========

// GetPlatformMetrics obtiene métricas de plataforma
func (h *AccountantDBHandler) GetPlatformMetrics(c *gin.Context) {
	startDateStr := c.DefaultQuery("start_date", time.Now().AddDate(0, 0, -7).Format("2006-01-02"))
	endDateStr := c.DefaultQuery("end_date", time.Now().Format("2006-01-02"))

	startDate, _ := time.Parse("2006-01-02", startDateStr)
	endDate, _ := time.Parse("2006-01-02", endDateStr)

	metrics, err := h.repo.GetPlatformMetrics(c.Request.Context(), startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo métricas"})
		return
	}
	c.JSON(http.StatusOK, metrics)
}

// ========== EXPENSE CATEGORIES ==========

// GetExpenseCategories obtiene categorías de gastos
func (h *AccountantDBHandler) GetExpenseCategories(c *gin.Context) {
	categories, err := h.repo.GetExpenseCategories(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo categorías"})
		return
	}
	c.JSON(http.StatusOK, categories)
}

// ========== OPERATING EXPENSES ==========

// GetOperatingExpenses obtiene gastos operativos
func (h *AccountantDBHandler) GetOperatingExpenses(c *gin.Context) {
	category := c.Query("category")
	status := c.Query("status")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	expenses, err := h.repo.GetOperatingExpenses(c.Request.Context(), category, status, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo gastos"})
		return
	}
	c.JSON(http.StatusOK, expenses)
}

// CreateOperatingExpense crea un gasto operativo
func (h *AccountantDBHandler) CreateOperatingExpense(c *gin.Context) {
	var req struct {
		ExpenseCategory  string    `json:"expense_category" binding:"required"`
		ExpenseType      string    `json:"expense_type" binding:"required"`
		Description      string    `json:"description"`
		Amount           float64   `json:"amount" binding:"required"`
		Currency         string    `json:"currency"`
		ExpenseDate      time.Time `json:"expense_date" binding:"required"`
		VendorID         *int64    `json:"vendor_id"`
		PaymentMethod    string    `json:"payment_method"`
		PaymentReference string    `json:"payment_reference"`
		IsRecurring      bool      `json:"is_recurring"`
		RecurrencePeriod string    `json:"recurrence_period"`
		Notes            string    `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	accountantID := h.getAccountantID(c)
	e := &repositories.OperatingExpense{
		ExpenseCategory:  req.ExpenseCategory,
		ExpenseType:      req.ExpenseType,
		Description:      req.Description,
		Amount:           req.Amount,
		Currency:         req.Currency,
		ExpenseDate:      req.ExpenseDate,
		VendorID:         req.VendorID,
		PaymentMethod:    req.PaymentMethod,
		PaymentReference: req.PaymentReference,
		IsRecurring:      req.IsRecurring,
		RecurrencePeriod: req.RecurrencePeriod,
		Notes:            req.Notes,
		CreatedBy:        accountantID,
	}

	id, err := h.repo.CreateOperatingExpense(c.Request.Context(), e)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando gasto"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Gasto creado"})
}

// ApproveExpense aprueba un gasto
func (h *AccountantDBHandler) ApproveExpense(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	accountantID := h.getAccountantID(c)
	if err := h.repo.ApproveExpense(c.Request.Context(), id, accountantID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error aprobando gasto"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Gasto aprobado"})
}

// ========== PAYMENT PROVIDERS ==========

// GetPaymentProviders obtiene proveedores de pago
func (h *AccountantDBHandler) GetPaymentProviders(c *gin.Context) {
	providers, err := h.repo.GetPaymentProviders(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo proveedores de pago"})
		return
	}
	c.JSON(http.StatusOK, providers)
}

// ========== ACCOUNTANT TASKS ==========

// GetAccountantTasks obtiene tareas del contador
func (h *AccountantDBHandler) GetAccountantTasks(c *gin.Context) {
	status := c.Query("status")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	accountantID := h.getAccountantID(c)
	tasks, err := h.repo.GetAccountantTasks(c.Request.Context(), accountantID, status, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo tareas"})
		return
	}
	c.JSON(http.StatusOK, tasks)
}

// CreateAccountantTask crea una tarea
func (h *AccountantDBHandler) CreateAccountantTask(c *gin.Context) {
	var req struct {
		TaskType          string     `json:"task_type" binding:"required"`
		Title             string     `json:"title" binding:"required"`
		Description       string     `json:"description"`
		Priority          string     `json:"priority"`
		DueDate           *time.Time `json:"due_date"`
		RelatedEntityType string     `json:"related_entity_type"`
		RelatedEntityID   *int64     `json:"related_entity_id"`
		Notes             string     `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	accountantID := h.getAccountantID(c)
	t := &repositories.AccountantTask{
		AccountantID:      accountantID,
		TaskType:          req.TaskType,
		Title:             req.Title,
		Description:       req.Description,
		Priority:          req.Priority,
		DueDate:           req.DueDate,
		RelatedEntityType: req.RelatedEntityType,
		RelatedEntityID:   req.RelatedEntityID,
		Notes:             req.Notes,
	}

	id, err := h.repo.CreateAccountantTask(c.Request.Context(), t)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando tarea"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Tarea creada"})
}

// CompleteTask completa una tarea
func (h *AccountantDBHandler) CompleteTask(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	accountantID := h.getAccountantID(c)
	if err := h.repo.CompleteTask(c.Request.Context(), id, accountantID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error completando tarea"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Tarea completada"})
}

// ========== CASH FLOW ==========

// GetCashFlowRecords obtiene registros de flujo de caja
func (h *AccountantDBHandler) GetCashFlowRecords(c *gin.Context) {
	startDateStr := c.DefaultQuery("start_date", time.Now().AddDate(0, -1, 0).Format("2006-01-02"))
	endDateStr := c.DefaultQuery("end_date", time.Now().Format("2006-01-02"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))

	startDate, _ := time.Parse("2006-01-02", startDateStr)
	endDate, _ := time.Parse("2006-01-02", endDateStr)

	records, err := h.repo.GetCashFlowRecords(c.Request.Context(), startDate, endDate, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo flujo de caja"})
		return
	}
	c.JSON(http.StatusOK, records)
}

// ========== DATA EXPORTS ==========

// GetDataExports obtiene exportaciones de datos
func (h *AccountantDBHandler) GetDataExports(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	accountantID := h.getAccountantID(c)
	exports, err := h.repo.GetDataExports(c.Request.Context(), accountantID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo exportaciones"})
		return
	}
	c.JSON(http.StatusOK, exports)
}

// CreateDataExport crea una exportación
func (h *AccountantDBHandler) CreateDataExport(c *gin.Context) {
	var req struct {
		ExportType     string     `json:"export_type" binding:"required"`
		ExportFormat   string     `json:"export_format"`
		FileName       string     `json:"file_name" binding:"required"`
		DateRangeStart *time.Time `json:"date_range_start"`
		DateRangeEnd   *time.Time `json:"date_range_end"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.ExportFormat == "" {
		req.ExportFormat = "csv"
	}

	accountantID := h.getAccountantID(c)
	id, err := h.repo.CreateDataExport(c.Request.Context(), req.ExportType, req.ExportFormat, req.FileName, req.DateRangeStart, req.DateRangeEnd, accountantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando exportación"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Exportación creada"})
}
