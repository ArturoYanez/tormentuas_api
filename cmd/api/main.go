package main

import (
	"context"
	"log"
	"tormentus/internal/database"
	"tormentus/internal/handlers"
	"tormentus/internal/repositories"
	"tormentus/pkg/configs"

	"github.com/gin-gonic/gin"
)

func main() {
	//Cargar configuracion
	cfg := config.Load()

	// Conectar a la base de datos
	db, err := database.NewDB(cfg)
	if err := nil {
		log.Fatal("Error conectando a la base de datos", err)
	}
	defer db.Close()

	// Obtener una conexion del pool
	conn, err := db.Pool.Acquire(context.Background())
	if err != nil {
		log.Fatal("Error obteniendo conexion", err)
	}
	defer conn.Release()

	// inicializar repositorio
	userRepo := repositories.NewPostgresUserRepository(conn.Conn())

	// Inicializar handler en el repositorio
	authHandler := handlers.NewAuthHandler(userRepo)
	
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
