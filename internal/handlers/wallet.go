package handlers

import (
	"net/http"
	"strconv"

	"tormentus/internal/models"
	"tormentus/internal/repositories"

	"github.com/gin-gonic/gin"
)

type WalletHandler struct {
	walletRepo repositories.WalletRepository
}

func NewWalletHandler(walletRepo repositories.WalletRepository) *WalletHandler {
	return &WalletHandler{walletRepo: walletRepo}
}

// GetWalletSummary obtiene el resumen de billeteras del usuario
func (h *WalletHandler) GetWalletSummary(c *gin.Context) {
	userID, _ := c.Get("userID")

	summary, err := h.walletRepo.GetWalletSummary(c.Request.Context(), userID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo resumen"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"summary": summary})
}

// GetWallets obtiene las billeteras del usuario
func (h *WalletHandler) GetWallets(c *gin.Context) {
	userID, _ := c.Get("userID")

	wallets, err := h.walletRepo.GetUserWallets(c.Request.Context(), userID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo billeteras"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"wallets": wallets})
}

// GetTransactions obtiene el historial de transacciones
func (h *WalletHandler) GetTransactions(c *gin.Context) {
	userID, _ := c.Get("userID")

	txType := c.DefaultQuery("type", "all")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	if limit > 100 {
		limit = 100
	}

	transactions, err := h.walletRepo.GetUserTransactions(c.Request.Context(), userID.(int64), txType, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo transacciones"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"transactions": transactions})
}

// GetDepositAddress obtiene o genera una dirección de depósito
func (h *WalletHandler) GetDepositAddress(c *gin.Context) {
	userID, _ := c.Get("userID")
	currency := c.Query("currency")
	network := c.Query("network")

	if currency == "" || network == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "currency y network son requeridos"})
		return
	}

	ctx := c.Request.Context()

	// Buscar dirección existente
	addr, err := h.walletRepo.GetDepositAddress(ctx, userID.(int64), currency, network)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error buscando dirección"})
		return
	}

	// Si no existe, crear una nueva
	if addr == nil {
		addr = &models.DepositAddress{
			UserID:   userID.(int64),
			Currency: currency,
			Network:  network,
		}
		if err := h.walletRepo.CreateDepositAddress(ctx, addr); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generando dirección"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"address": addr})
}


// WithdrawRequest estructura para solicitar retiro
type WithdrawRequest struct {
	Amount   float64 `json:"amount" binding:"required,gt=0"`
	Currency string  `json:"currency" binding:"required"`
	Network  string  `json:"network"`
	Address  string  `json:"address" binding:"required"`
}

// RequestWithdrawal solicita un retiro
func (h *WalletHandler) RequestWithdrawal(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req WithdrawRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := c.Request.Context()

	// Obtener wallet live
	wallet, err := h.walletRepo.GetWalletByType(ctx, userID.(int64), models.WalletLive)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo billetera"})
		return
	}

	if wallet == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No tienes billetera activa"})
		return
	}

	// Calcular fee (2 USDT fijo por ahora)
	fee := 2.0
	totalAmount := req.Amount + fee

	// Verificar balance disponible
	pendingAmount, _ := h.walletRepo.GetPendingWithdrawalAmount(ctx, userID.(int64))
	availableBalance := wallet.Balance - pendingAmount

	if totalAmount > availableBalance {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":             "Balance insuficiente",
			"code":              "INSUFFICIENT_BALANCE",
			"available_balance": availableBalance,
			"required":          totalAmount,
		})
		return
	}

	// Mínimo de retiro
	if req.Amount < 10 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El monto mínimo de retiro es $10"})
		return
	}

	// Crear solicitud de retiro
	withdrawal := &models.WithdrawalRequest{
		UserID:   userID.(int64),
		WalletID: &wallet.ID,
		Amount:   req.Amount,
		Currency: req.Currency,
		Network:  &req.Network,
		Address:  req.Address,
		Fee:      fee,
	}

	if err := h.walletRepo.CreateWithdrawalRequest(ctx, withdrawal); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando solicitud de retiro"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Solicitud de retiro creada exitosamente",
		"withdrawal": withdrawal,
	})
}

// GetWithdrawals obtiene las solicitudes de retiro del usuario
func (h *WalletHandler) GetWithdrawals(c *gin.Context) {
	userID, _ := c.Get("userID")

	status := c.DefaultQuery("status", "all")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	withdrawals, err := h.walletRepo.GetUserWithdrawals(c.Request.Context(), userID.(int64), status, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo retiros"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"withdrawals": withdrawals})
}

// CancelWithdrawal cancela una solicitud de retiro pendiente
func (h *WalletHandler) CancelWithdrawal(c *gin.Context) {
	userID, _ := c.Get("userID")
	withdrawalID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	ctx := c.Request.Context()

	// Verificar que el retiro existe y pertenece al usuario
	withdrawal, err := h.walletRepo.GetWithdrawalByID(ctx, withdrawalID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo retiro"})
		return
	}

	if withdrawal == nil || withdrawal.UserID != userID.(int64) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Retiro no encontrado"})
		return
	}

	if withdrawal.Status != models.TxPending {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Solo se pueden cancelar retiros pendientes"})
		return
	}

	if err := h.walletRepo.CancelWithdrawal(ctx, withdrawalID, userID.(int64)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error cancelando retiro"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Retiro cancelado exitosamente"})
}

// GetCryptoOptions devuelve las opciones de criptomonedas disponibles
func (h *WalletHandler) GetCryptoOptions(c *gin.Context) {
	options := []gin.H{
		{"symbol": "USDT", "name": "Tether", "networks": []string{"TRC20", "ERC20", "BEP20"}, "min_deposit": 10, "min_withdrawal": 10, "fee": 2},
		{"symbol": "BTC", "name": "Bitcoin", "networks": []string{"BTC"}, "min_deposit": 0.0001, "min_withdrawal": 0.001, "fee": 0.0001},
		{"symbol": "ETH", "name": "Ethereum", "networks": []string{"ERC20"}, "min_deposit": 0.01, "min_withdrawal": 0.01, "fee": 0.005},
		{"symbol": "BNB", "name": "BNB", "networks": []string{"BEP20"}, "min_deposit": 0.01, "min_withdrawal": 0.01, "fee": 0.001},
		{"symbol": "SOL", "name": "Solana", "networks": []string{"SOL"}, "min_deposit": 0.1, "min_withdrawal": 0.1, "fee": 0.01},
	}

	c.JSON(http.StatusOK, gin.H{"options": options})
}
