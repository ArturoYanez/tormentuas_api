package main

import (
	"context"
	"log"
	"time"

	"tormentus/internal/auth"
	"tormentus/internal/database"
	"tormentus/internal/handlers"
	"tormentus/internal/middleware"
	"tormentus/internal/repositories"
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

	log.Println("Servidor iniciado en http://localhost:" + cfg.ServerPort)
	r.Run(":8080")
}
