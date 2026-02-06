package middleware

import (
	"net/http"
	"strings"

	"tormentus/internal/auth"
	"tormentus/internal/repositories"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware - Verifica el JWT en los requests
func AuthMiddleware(jwtManager *auth.JWTManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Obtencion de token del header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Token de autorizacion requerido",
			})
			c.Abort()
			return
		}

		// Extraer el token (format: "Bearer <token>")
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Formato de autorizacion invalido. Use: Bearer <token>",
			})
			c.Abort()
			return
		}

		tokenString := parts[1]

		// Verificar el token
		claims, err := jwtManager.Verify(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Token invalido o expirado",
			})
			c.Abort()
			return
		}

		// Guardar informacion del usuario en el contexto
		c.Set("userID", claims.UserID)
		c.Set("userEmail", claims.Email)
		// Por defecto, marcar como verificado para usuarios de prueba
		c.Set("isVerified", true)

		c.Next() // Continuar con el siguiente handler
	}
}

// AuthMiddlewareWithRepo - Verifica JWT y obtiene datos del usuario
func AuthMiddlewareWithRepo(jwtManager *auth.JWTManager, userRepo repositories.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token de autorizacion requerido"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Formato de autorizacion invalido"})
			c.Abort()
			return
		}

		claims, err := jwtManager.Verify(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token invalido o expirado"})
			c.Abort()
			return
		}

		// Obtener usuario de la base de datos
		user, err := userRepo.GetUserByID(c.Request.Context(), claims.UserID)
		if err != nil || user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no encontrado"})
			c.Abort()
			return
		}

		c.Set("userID", user.ID)
		c.Set("userEmail", user.Email)
		c.Set("userRole", string(user.Role))
		c.Set("isVerified", user.IsVerified)
		c.Set("user", user)

		c.Next()
	}
}
