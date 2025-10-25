package main

import (
	"log"
	"tormentus/internal/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	// Inicializar el router
	r := gin.Default()

	// Inicializar el handler
	authHandler := handlers.NewAuthHandler()

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

	api := r.Group("/api")
	{
		authGroup := api.Group("/auth") // /api/auth/*
		{
			authGroup.GET("/profile", authHandler.GetProfile)
			authGroup.POST("/login", authHandler.Login)
			authGroup.POST("/register", authHandler.Register)
		}
	}

	log.Println("Servidor iniciado en http://localhost:8080")
	r.Run(":8080")
}
