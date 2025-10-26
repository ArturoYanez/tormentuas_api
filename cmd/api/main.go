package main

import (
	"context"
	"log"
	"tormentus/internal/database"
	"tormentus/internal/handlers"
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

	// Verificar que podemos consultar la tabla
	var tableExists bool
	err = conn.QueryRow(context.Background(),
		"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')").Scan(&tableExists)

	if err != nil {
		log.Fatal("Error verificando tabla users:", err)
	}

	if tableExists {
		log.Println("Tabla 'users' verificada - existe en la base de datos")
	} else {
		log.Fatal("Tabla 'users' NO existe en la base de datos")
	}

	// inicializar repositorio
	userRepo := repositories.NewPostgresUserRepository(conn.Conn())
	log.Println("Repositorio de usuarios inicializado")

	// Inicializar handler en el repositorio
	authHandler := handlers.NewAuthHandler(userRepo)
	log.Println("Handler de autenticación inicializado")

	// Inicializar el router
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

	api := r.Group("/api")
	{
		authGroup := api.Group("/auth") // /api/auth/*
		{
			authGroup.GET("/profile", authHandler.GetProfile)
			authGroup.POST("/login", authHandler.Login)
			authGroup.POST("/register", authHandler.Register)
		}
	}

	log.Println("Servidor iniciado en http://localhost:" + cfg.ServerPort)
	r.Run(":8080")
}
