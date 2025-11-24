package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"tormentus/internal/auth"
	"tormentus/internal/database"
	"tormentus/internal/handlers"
	"tormentus/internal/middleware"
	"tormentus/internal/repositories"
	"tormentus/internal/services"
	"tormentus/pkg/config"

	"github.com/gin-gonic/gin"
)

func main() {
	//Cargar configuracion
	cfg := config.Load()

	// Conectar a la base de datos
	db, err := database.NewDB(cfg)
	if err != nil {
		log.Fatal("Error conectando a la base de datos", err)
	}
	defer db.Close()

	log.Println("Conectado a PostgreSQL exitosamente")

	// Ejecucion de migraciones
	if err := database.RunMigrations(db.SQL, "./migrations"); err != nil {
		log.Fatal(err)
	}

	// Obtener una conexion del pool
	conn, err := db.Pool.Acquire(context.Background())
	if err != nil {
		log.Fatal("Error obteniendo conexion", err)
	}
	defer conn.Release()

	log.Println("Conexión adquirida del pool")

	// Inicializar JWT Manager
	jwtManager := auth.NewJWTManager(
		"mi-clave-secreta-muy-segura-para-jwt", // En produccion, usar variable de entorno
		24*time.Hour,                           // Token expira en 24h
	)

	// Inicializar Refresh Token Manager (opcional)
	refreshManager := auth.NewRefreshTokenManager(
		"mi-clave-secreta-refresh",
		30*24*time.Hour, // 30 dias
	)

	// inicializar repositorio
	userRepo := repositories.NewPostgresUserRepository(conn.Conn())
	log.Println("Repositorio de usuarios inicializado")

	// Inicializar repositorio de refresh tokens
	refreshTokenRepo := repositories.NewPostgresRefreshTokenRepository(conn.Conn())
	log.Println("Repositorio de refresh tokens inicializado")

	// Inicializar handler de autenticación
	authHandler := handlers.NewAuthHandler(userRepo, refreshTokenRepo, jwtManager, refreshManager)
	log.Println("Handler de autenticación inicializado")

	// Inicializar el router
	r := gin.Default()

	// Configuracion de Middleware Global
	r.Use(func(c *gin.Context) {
		c.Header("Access--Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Next()
	})

	// Routes publicas sin autenticacion

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
	{ // Rutas publicas de auth
		authGroup := api.Group("/auth")
		{
			authGroup.POST("/login", authHandler.Login)
			authGroup.POST("/register", authHandler.Register)
		}

		// rutas protegidas - requiere JWT
		protected := api.Group("/protected")
		protected.Use(middleware.AuthMiddleware(jwtManager)) // Middleware aplicado
		{
			protected.GET("/profile", authHandler.GetProfile)
			// Mas rutas protegidas por JWT aqui
		}

		// ruta para refresh token
		authGroup.POST("/refresh", authHandler.RefreshToken)

	}

	// Inicializar servicio de precios con Mock
	priceRepo := repositories.NewMockPriceRepository()  // Repositorio mock
	priceService := services.NewPriceService(priceRepo) // Por ahora sin repo

	// Iniciarlizar con simbolos populares
	symbols := []string{"btcusdt", "ethusdt", "adausdt"}
	if err := priceService.Start(symbols); err != nil {
		log.Printf("No se pudo iniciar servicio de precios: %x", err)
	} else {
		log.Printf("Servicio de precios iniciando correctamente para symbolos: %s", symbols)
		defer priceService.Stop() // Defer para cleanup
	}

	// Inicializar handler de WebSocket
	wsHandler := handlers.NewWebSocketHandler(priceService)

	// Agregar ruta WebSocket
	api.GET("/ws", wsHandler.HandlerWebSocket)

	// Setup graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Start server in a goroutine
	go func() {
		log.Println("Servidor iniciado en http://localhost:" + cfg.ServerPort)
		if err := r.Run(":8080"); err != nil {
			log.Fatal("Error starting server:", err)
		}
	}()

	// Wait for interrupt signal
	<-quit
	log.Println("Shutting down server...")

	// Cleanup
	if priceService != nil {
		priceService.Stop()
	}

	log.Println("Server exited")
}
