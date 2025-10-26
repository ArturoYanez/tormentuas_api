package middleware

import (
	"net/http"
	"strings"

	"tormentus/internal/auth"

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

		c.Next() // Continuar con el siguiente handler
	}
}
