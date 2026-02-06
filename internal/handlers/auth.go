package handlers

import (
	"net/http"

	"tormentus/internal/auth"
	"tormentus/internal/models"
	"tormentus/internal/repositories"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	userRepo   repositories.UserRepository
	jwtManager *auth.JWTManager
}

func NewAuthHandler(userRepo repositories.UserRepository, jwtManager *auth.JWTManager) *AuthHandler {
	return &AuthHandler{
		userRepo:   userRepo,
		jwtManager: jwtManager,
	}
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

	user, err := h.userRepo.GetUserByEmail(c.Request.Context(), credentials.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error buscando el usuario en base de datos",
		})
		return
	}

	if user == nil || !user.CheckPassword(credentials.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Credenciales invalidas",
		})
		return
	}

	token, err := h.jwtManager.Generate(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Error generando token",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login exitoso",
		"token":   token,
		"user": gin.H{
			"id":                  user.ID,
			"email":               user.Email,
			"first_name":          user.FirstName,
			"last_name":           user.LastName,
			"role":                user.Role,
			"balance":             user.Balance,
			"demo_balance":        user.DemoBalance,
			"is_verified":         user.IsVerified,
			"verification_status": user.VerificationStatus,
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

	existingUser, err := h.userRepo.GetUserByEmail(c.Request.Context(), req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error verificando usuario: " + err.Error(),
		})
		return
	}

	if existingUser != nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": "El email ya esta registrado",
		})
		return
	}

	user := &models.User{
		Email:              req.Email,
		Password:           req.Password,
		FirstName:          req.FirstName,
		LastName:           req.LastName,
		Role:               models.RoleUser,
		Balance:            0,
		DemoBalance:        10000,
		IsVerified:         false,
		VerificationStatus: models.VerificationPending,
	}

	if err := user.HashPassword(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Error al procesar contraseña",
			"details": err.Error(),
		})
		return
	}

	if err := h.userRepo.CreateUser(c.Request.Context(), user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Error creando usuario en base de datos",
			"details": err.Error(),
		})
		return
	}

	token, err := h.jwtManager.Generate(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Error al generar token",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Registro exitoso",
		"token":   token,
		"user": gin.H{
			"id":                  user.ID,
			"email":               user.Email,
			"first_name":          user.FirstName,
			"last_name":           user.LastName,
			"role":                user.Role,
			"balance":             user.Balance,
			"demo_balance":        user.DemoBalance,
			"is_verified":         user.IsVerified,
			"verification_status": user.VerificationStatus,
		},
	})
}

func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	user, err := h.userRepo.GetUserByID(c.Request.Context(), userID.(int64))
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":                  user.ID,
			"email":               user.Email,
			"first_name":          user.FirstName,
			"last_name":           user.LastName,
			"role":                user.Role,
			"balance":             user.Balance,
			"demo_balance":        user.DemoBalance,
			"is_verified":         user.IsVerified,
			"verification_status": user.VerificationStatus,
			"created_at":          user.CreatedAt,
		},
	})
}
