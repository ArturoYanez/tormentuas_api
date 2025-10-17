package handlers

import (
	"fmt"
	"net/http"
	"time"

	"tormentus/internal/models"

	"github.com/gin-gonic/gin"
)

// AuthHandler - Struct para agregar metodos relacionados
type AuthHandler struct {
	//Aqui iran dependencias como userService (se agregara luego)
}

// NewAuthHandler - Factory function (Patron comun en Go)
func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

// Login - Maneja las peticiones POST /api/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	//Definir estructura para el Body de la peticion
	var credentials struct {
		Email    string `json:"email" binding:"required,email"` // binding:"required" = Joi validation
		Password string `json:"password" binding:"required"`
	}

	//Validar y bindear Json
	if err := c.ShouldBindJSON(&credentials); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Email y password requeridos",
			"details": err.Error(), // Gin genera detalles del error automaticos
		})
		return // IMPORTANTE: return despues de error
	}

	//Buscar usuario en db (Por ahora MOCK)
	mockUser := &models.User{
		ID:       "user-123",
		Email:    credentials.Email,
		Password: "$2a$10$hashed_password_mock", //bcrypt hash de  "123456"
	}

	//Verificar password
	c.JSON(http.StatusOK, gin.H{
		"message": "Login exitoso",
		"token":   "jwt-token-mock", //Se implementara luego
		"user": gin.H{ //gin.H es map[string]interface{} = ojeto en JS
			"id":    mockUser.ID,
			"email": mockUser.Email,
		},
	})
}

type RegisterHandler struct {
	//Aqui iran dependencias como userService (se agregara luego)
}

// NewRegisterHandler - Factory function (Patron comun en Go)
func NewRegisterHandler() *RegisterHandler {
	return &RegisterHandler{}
}

// Register - Maneja las peticiones POST /api/auth/register
func (h *RegisterHandler) Register(c *gin.Context) {
	//Definir estructura para el Body de la peticion
	var credentials struct {
		Email     string `json:"email" binding:"required,email"`
		Password  string `json:"password" binding:"required"`
		FirstName string `json:"FirstName" binding:"required"`
		LastName  string `json:"LastName" binding:"required"`
	}

	if err := c.ShouldBindJSON(&credentials); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Email, password, firstName y lastName requeridos",
			"details": err.Error(),
		})
		return
	}

	user := &models.User{
		Email:     credentials.Email,
		Password:  credentials.Password, // Password en texto plano por ahora
		FirstName: credentials.FirstName,
		LastName:  credentials.LastName,
	}

	// Hashear Password
	if err := user.HashPassword(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Error al hashear password",
			"details": err.Error(),
		})
		return
	}

	//Guardar usuario en db (Por ahora MOCK)
	user.ID = "user-" + fmt.Sprintf("%d", time.Now().Unix()) //ID Temporal
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	//Enviar respuesta - sin enviar password
	c.JSON(http.StatusCreated, gin.H{
		"message": "Registro exitoso",
		"user": gin.H{
			"id":        user.ID,
			"email":     user.Email,
			"firstName": user.FirstName,
			"lastName":  user.LastName,
			"createdAt": user.CreatedAt,
		},
	})
}
