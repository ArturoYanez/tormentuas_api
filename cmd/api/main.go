package main

import (
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Servir archivos estáticos
	r.Static("/static", "./web/static")

	// Configurar templates - PATRÓN CORREGIDO
	r.LoadHTMLGlob("web/templates/*")

	// Ruta de landing page
	r.GET("/", func(c *gin.Context) {
		c.HTML(200, "base.html", gin.H{
			"title": "CryptoBroker - Trading Seguro",
		})
	})

	// API Group
	{
		api := r.Group("/api")

		// Health check API
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status":  "ok",
				"service": "tormentus",
				"version": "0.1.0",
			})
		})

		// Ruta para User Profile
		api.GET("/user/profile", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status":  "ok",
				"service": "tormentus",
				"version": "0.1.0",
			})
		})
	}

	log.Println("Servidor iniciado en http://localhost:8080")
	r.Run(":8080")
}
