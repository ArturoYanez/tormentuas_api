package handlers

import (
	"fmt"
	"net/http"
	"time"

	"tormentus/internal/models"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	// Dependencias futuras
}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var credentials struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&credentials); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Email y password requeridos",
			"details": err.Error(),
		})
		return
	}

	// Mock user (temporal)
	mockUser := &models.User{
		ID:       "user-123",
		Email:    credentials.Email,
		Password: "$2a$10$hashed_password_mock",
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login exitoso",
		"token":   "jwt-token-mock",
		"user": gin.H{
			"id":    mockUser.ID,
			"email": mockUser.Email,
		},
	})
}

func (h *AuthHandler) Register(c *gin.Context) {

	var req struct {
		Email     string `json:"email" binding:"required,email"`
		Password  string `json:"password" binding:"required,min=6"`
		FirstName string `json:"first_name" binding:"required"`
		LastName  string `json:"last_name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Todos los campos son requeridos",
			"details": err.Error(),
		})
		return
	}

	user := &models.User{
		Email:     req.Email,
		Password:  req.Password,
		FirstName: req.FirstName,
		LastName:  req.LastName,
	}

	if err := user.HashPassword(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error al procesar contraseña",
		})
		return
	}

	user.ID = "user-" + fmt.Sprintf("%d", time.Now().Unix())
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	c.JSON(http.StatusCreated, gin.H{
		"message": "Registro exitoso",
		"user": gin.H{
			"id":         user.ID,
			"email":      user.Email,
			"first_name": user.FirstName,
			"last_name":  user.LastName,
			"created_at": user.CreatedAt,
		},
	})
}

func (h *AuthHandler) GetProfile(c *gin.Context) {
	user := &models.User{
		ID:        "user-profile-123",
		Email:     "maria.garcia@empresa.com",
		FirstName: "María",
		LastName:  "García",
		CreatedAt: time.Now().AddDate(0, 0, -7),
		UpdatedAt: time.Now().AddDate(0, 0, -7),
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Perfil obtenido exitosamente",
		"user": gin.H{
			"id":         user.ID,
			"email":      user.Email,
			"first_name": user.FirstName,
			"last_name":  user.LastName,
			"created_at": user.CreatedAt,
		},
	})
}
