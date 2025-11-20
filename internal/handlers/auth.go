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
	userRepo            repositories.UserRepository         // Repositorio de Usuarios
	refreshTokenRepo    repositories.RefreshTokenRepository // Repositorio de RefreshToken (opcional)
	jwtManager          *auth.JWTManager                    // Nueva dependencia Json Web Token Manager
	refreshTokenManager *auth.RefreshTokenManager           // Generador de refresh tokens (opcional)
}

func NewAuthHandler(userRepo repositories.UserRepository, refreshRepo repositories.RefreshTokenRepository, jwtManager *auth.JWTManager, refreshManager *auth.RefreshTokenManager) *AuthHandler {
	return &AuthHandler{
		userRepo:            userRepo,
		refreshTokenRepo:    refreshRepo,
		jwtManager:          jwtManager,
		refreshTokenManager: refreshManager,
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
	accessToken, err := h.jwtManager.Generate(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Error generando token",
			"details": err.Error(),
		})
		return
	}
	// Generar refresh token si existe el manager
	var refreshToken string
	if h.refreshTokenManager != nil {
		rt, err := h.refreshTokenManager.GenerateRefreshToken()
		if err == nil {
			refreshToken = rt
			// Intentar almacenar el refresh token si existe el repo
			if h.refreshTokenRepo != nil {
				_ = h.refreshTokenRepo.Create(c.Request.Context(), &models.RefreshToken{
					UserID:    user.ID,
					Token:     refreshToken,
					ExpiresAt: time.Now().Add(30 * 24 * time.Hour),
					CreatedAt: time.Now(),
				})
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login exitoso",
		"tokens": gin.H{
			"access_token":  accessToken,
			"refresh_token": refreshToken,
			"expires_in":    3600, // 1 hora en segundos
		},
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
		return
	}
	// Generar refresh token (si se puede)
	var refreshToken string
	if h.refreshTokenManager != nil {
		if rt, err := h.refreshTokenManager.GenerateRefreshToken(); err == nil {
			refreshToken = rt
			if h.refreshTokenRepo != nil {
				_ = h.refreshTokenRepo.Create(c.Request.Context(), &models.RefreshToken{
					UserID:    user.ID,
					Token:     refreshToken,
					ExpiresAt: time.Now().Add(30 * 24 * time.Hour),
					CreatedAt: time.Now(),
				})
			}
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Registro exitoso",
		"tokens": gin.H{
			"access_token":  token,
			"refresh_token": refreshToken,
			"expires_in":    3600,
		},
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

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Refresh token requerido"})
		return
	}

	// Si no hay un repositorio de refresh tokens implementado, devolver 501
	if h.refreshTokenRepo == nil {
		c.JSON(http.StatusNotImplemented, gin.H{"error": "Refresh token store not implemented"})
		return
	}

	// Verificar refresh token en DB
	storedToken, err := h.refreshTokenRepo.GetByToken(c.Request.Context(), req.RefreshToken)
	if err != nil || storedToken == nil || storedToken.ExpiresAt.Before(time.Now()) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token inválido"})
		return
	}

	// Generar nuevo acceso token
	user, err := h.userRepo.GetUserByID(c.Request.Context(), storedToken.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo usuario"})
		return
	}

	newAccessToken, err := h.jwtManager.Generate(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generando el token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token": newAccessToken,
		"expires_in":   3600,
	})

}
