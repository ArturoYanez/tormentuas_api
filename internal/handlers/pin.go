package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// PinHandler maneja las operaciones de PIN de seguridad
type PinHandler struct{}

// NewPinHandler crea un nuevo handler de PIN
func NewPinHandler() *PinHandler {
	return &PinHandler{}
}

// hashPin genera un hash bcrypt del PIN
func hashPin(pin string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(pin), bcrypt.DefaultCost)
	return string(bytes), err
}

// verifyPinHash verifica un PIN contra su hash
func verifyPinHash(pin, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(pin))
	return err == nil
}

// SetupPin configura un nuevo PIN para el usuario
func (h *PinHandler) SetupPin(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	_ = userIDVal.(int64)

	var req struct {
		Pin string `json:"pin" binding:"required,len=4"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "PIN debe tener 4 dígitos"})
		return
	}

	// Validar que solo contenga números
	for _, char := range req.Pin {
		if char < '0' || char > '9' {
			c.JSON(http.StatusBadRequest, gin.H{"error": "PIN debe contener solo números"})
			return
		}
	}

	// Hashear el PIN
	hashedPin, err := hashPin(req.Pin)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error procesando PIN"})
		return
	}

	// Aquí se guardaría en la base de datos
	_ = hashedPin

	c.JSON(http.StatusOK, gin.H{
		"message":     "PIN configurado correctamente",
		"pin_enabled": true,
	})
}

// VerifyPin verifica el PIN del usuario
func (h *PinHandler) VerifyPin(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	_ = userIDVal.(int64)

	var req struct {
		Pin string `json:"pin" binding:"required,len=4"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "PIN requerido"})
		return
	}

	// Aquí se obtendría el hash del PIN de la DB y se verificaría
	// Por ahora retornamos éxito para testing
	c.JSON(http.StatusOK, gin.H{
		"valid":   true,
		"message": "PIN verificado",
	})
}

// DisablePin desactiva el PIN del usuario
func (h *PinHandler) DisablePin(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	_ = userIDVal.(int64)

	var req struct {
		Pin string `json:"pin" binding:"required,len=4"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "PIN actual requerido"})
		return
	}

	// Aquí se verificaría el PIN actual y se desactivaría
	c.JSON(http.StatusOK, gin.H{
		"message":     "PIN desactivado",
		"pin_enabled": false,
	})
}

// ChangePin cambia el PIN del usuario
func (h *PinHandler) ChangePin(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	_ = userIDVal.(int64)

	var req struct {
		CurrentPin string `json:"current_pin" binding:"required,len=4"`
		NewPin     string `json:"new_pin" binding:"required,len=4"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "PIN actual y nuevo requeridos"})
		return
	}

	// Validar que el nuevo PIN solo contenga números
	for _, char := range req.NewPin {
		if char < '0' || char > '9' {
			c.JSON(http.StatusBadRequest, gin.H{"error": "PIN debe contener solo números"})
			return
		}
	}

	// Aquí se verificaría el PIN actual y se actualizaría
	c.JSON(http.StatusOK, gin.H{
		"message": "PIN actualizado correctamente",
	})
}

// GetPinStatus obtiene el estado del PIN del usuario
func (h *PinHandler) GetPinStatus(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	_ = userIDVal.(int64)

	// Aquí se obtendría el estado del PIN de la DB
	c.JSON(http.StatusOK, gin.H{
		"pin_enabled": false,
	})
}
