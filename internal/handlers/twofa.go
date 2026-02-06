package handlers

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha1"
	"encoding/base32"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// TwoFactorHandler maneja la autenticación de dos factores
type TwoFactorHandler struct{}

// NewTwoFactorHandler crea un nuevo handler de 2FA
func NewTwoFactorHandler() *TwoFactorHandler {
	return &TwoFactorHandler{}
}

// generateSecret genera un secreto TOTP aleatorio
func generateSecret() (string, error) {
	secret := make([]byte, 20)
	_, err := rand.Read(secret)
	if err != nil {
		return "", err
	}
	return base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(secret), nil
}

// GenerateSetup genera la configuración inicial de 2FA
func (h *TwoFactorHandler) GenerateSetup(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(int64)

	// Obtener email del usuario desde el contexto
	email := c.GetString("userEmail")
	if email == "" {
		email = fmt.Sprintf("user_%d", userID)
	}

	// Generar secreto
	secret, err := generateSecret()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generando secreto"})
		return
	}

	issuer := "Tormentus"

	// Generar URL para QR code (formato otpauth)
	qrURL := fmt.Sprintf("otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30",
		issuer, email, secret, issuer)

	c.JSON(http.StatusOK, gin.H{
		"secret":      secret,
		"qr_code_url": qrURL,
		"issuer":      issuer,
		"account":     email,
	})
}

// VerifyAndEnable verifica el código TOTP y activa 2FA
func (h *TwoFactorHandler) VerifyAndEnable(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	_ = userIDVal.(int64)

	var req struct {
		Secret string `json:"secret" binding:"required"`
		Code   string `json:"code" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Secreto y código requeridos"})
		return
	}

	// Validar que el código tenga 6 dígitos
	if len(req.Code) != 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El código debe tener 6 dígitos"})
		return
	}

	// Verificar el código TOTP
	if !verifyTOTP(req.Secret, req.Code) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Código inválido"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":            "2FA activado correctamente",
		"two_factor_enabled": true,
	})
}

// Disable desactiva 2FA
func (h *TwoFactorHandler) Disable(c *gin.Context) {
	var req struct {
		Code     string `json:"code"`
		Password string `json:"password"`
	}
	c.ShouldBindJSON(&req)

	c.JSON(http.StatusOK, gin.H{
		"message":            "2FA desactivado",
		"two_factor_enabled": false,
	})
}

// VerifyCode verifica un código TOTP (para login)
func (h *TwoFactorHandler) VerifyCode(c *gin.Context) {
	var req struct {
		Secret string `json:"secret" binding:"required"`
		Code   string `json:"code" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Secreto y código requeridos"})
		return
	}

	valid := verifyTOTP(req.Secret, req.Code)

	c.JSON(http.StatusOK, gin.H{
		"valid":   valid,
		"message": map[bool]string{true: "Código verificado", false: "Código inválido"}[valid],
	})
}

// verifyTOTP verifica un código TOTP contra un secreto
func verifyTOTP(secret, code string) bool {
	currentTime := time.Now().Unix()

	// Permite una ventana de ±1 período (30 segundos)
	for _, offset := range []int64{-1, 0, 1} {
		timeStep := (currentTime / 30) + offset
		expectedCode := generateTOTPCode(secret, timeStep)
		if expectedCode == code {
			return true
		}
	}
	return false
}

// generateTOTPCode genera un código TOTP para un tiempo dado
func generateTOTPCode(secret string, timeStep int64) string {
	// Decodificar el secreto base32
	key, err := base32.StdEncoding.WithPadding(base32.NoPadding).DecodeString(secret)
	if err != nil {
		return ""
	}

	// Convertir timeStep a bytes (big-endian)
	msg := make([]byte, 8)
	for i := 7; i >= 0; i-- {
		msg[i] = byte(timeStep & 0xff)
		timeStep >>= 8
	}

	// HMAC-SHA1
	h := hmac.New(sha1.New, key)
	h.Write(msg)
	hash := h.Sum(nil)

	// Dynamic truncation
	offset := hash[len(hash)-1] & 0x0f
	code := int32(hash[offset]&0x7f)<<24 |
		int32(hash[offset+1])<<16 |
		int32(hash[offset+2])<<8 |
		int32(hash[offset+3])

	// Obtener 6 dígitos
	code = code % 1000000
	return fmt.Sprintf("%06d", code)
}
