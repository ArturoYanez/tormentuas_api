package handlers

import (
	"net/http"
	"time"

	"tormentus/internal/auth"
	"tormentus/internal/models"
	"tormentus/internal/repositories"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	userRepo   repositories.UserRepository // Repositorio de Usuarios
	RefreshTokenRepo repositories.RefreshTokenRepository // Repositorio de RefreshToken
	jwtManager *auth.JWTManager            // Nueva dependencia Json Web Token Manager
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

	// Buscar usuario en la base de datos
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

	// Generar JWT Token (New)
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
		"tokens": gin.H{
			"access_token": accessToken,
			"refresh_token": refreshToken,
			"expires_in": 3600, // 1 hora en segundos
		} // Ahora es un JWT real
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
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

	//Verifica si el usuario ya existe
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
		Email:     req.Email,
		Password:  req.Password,
		FirstName: req.FirstName,
		LastName:  req.LastName,
	}

	if err := user.HashPassword(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Error al procesar contraseña",
			"details": err.Error(),
		})
		return
	}

	// Guardar en base de datos real
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
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Registro exitoso",
		"tokens": gin.H{
			"acess_token": accessToken,
			"refresh_token": refreshToken,
			"expires_in": 3600,
		}
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

func (h *AuthHandler) RefreshToken(c *gin.Context){
	var req struct {
		RefreshToken string `json: "refresh_token" binding: "required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": "Refresh token requerido"})
		return
	}

	// Verificar refresh token en DB
	storedToken, err := h.RefreshTokenRepo.GetByToken(c.Request.Context(), req.RefreshToken)
	if err != nil || storedToken == nil || storedToken.ExpiresAt.Before(time.now()) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token invalido"})
		return
	}

	// Generar nuevo acceso token
	user, err := h.UserRepo.GetUserByID(c.Request.context(), storedToken.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo usuario"})
		return
	}

	newAccessToken, err := h.jwtManager.Generate(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generando el token"})
	}

	c.JSON(http.StatusOk, gin.H{
		"access_token": newAccessToken,
		"expirest_at": 3600,
	})

}
