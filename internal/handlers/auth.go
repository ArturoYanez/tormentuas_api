package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"tormentus/internal/models"
)

//AuthHandler - Struct para agregar metodos relacionados
type AuthHandler struct {
	//Aqui iran dependencias como userService (se agregara luego)
}


// NewAuthHandler - Factory function (Patron comun en Go)
func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}


// Login - Maneja las peticiones POST /api/auth/login
func (h *AuthHanlder) Login(c *gin.Context) {
	//Definir estructura para el Body de la peticion
	var creadentials struct {
		Email		string	`json: "email" binding: "required"`		// binding:"required" = Joi validation
		Password	string	`json: "password" binding: "required"`
	}

	//Validar y bindear Json
	if err := c.ShouldBindJSON(&creadentials); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Email y password requeridos",
			"details:" err.Error(), // Gin genera detalles del error automaticos
		})
		return // IMPORTANTE: return despues de error
	}

	//Buscar usuario en db (Por ahora MOCK)
	mockUser := &models.User{
		ID: "user-123",
		Email: credentials.Email,
		Password: "$2a$10$hashed_password_mock", //bcrypt hash de  "123456"
	}

	//Verificar password
	c.JSON(http.StatusOK, gin.H{
		"message": "Login exitoso",
		"token": "jwt-token-mock", //Se implementara luego\
		"user":  gin.H{ //gin.H es map[string]interface{} = ojeto en JS
			"id":		mockUser.ID,
			"email":	mockUser.Email,
		},

	})
}