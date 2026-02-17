package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost     string
	DBPort     int
	DBUser     string
	DBPassword string
	DBName     string
	ServerPort string
	JWTSecret  string
}

// Cargade fichero .env silenciosamente
func init() {
	// Se intenta cargar el archivo .env
	if err := godotenv.Load(); err != nil {
		fmt.Printf("No se pudo cargar archivo .env: %v", err)
		fmt.Println("Usando variables de entorno del sistema o valores por defecto")
	}
}

func Load() *Config {
	return &Config{
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnvAsInt("DB_PORT", 5432),
		DBUser:     getEnv("DB_USER", "tormentus_user"),
		DBPassword: getEnv("DB_PASSWORD", "tormentus_password"),
		DBName:     getEnv("DB_NAME", "tormentus_dev"),
		ServerPort: getEnv("SERVER_PORT", "8080"),
		JWTSecret:  getEnv("JWT_SECRET", "placeholder-secret-change-this-in-env"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	fmt.Printf("Variable %s no encontrada, usando valor por defecto: %s\n", key, defaultValue)
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	fmt.Printf("Variable %s no encontrada, usando valor por defecto: %d\n", key, defaultValue)
	return defaultValue
}

func (c *Config) Validate() error {
	if c.DBHost == "" {
		return fmt.Errorf("DB_HOST no puede estar vacio")
	}
	if c.DBPort <= 0 || c.DBPort > 65535 {
		return fmt.Errorf("DB_PORT inválido: %d", c.DBPort)
	}
	if c.DBUser == "" {
		return fmt.Errorf("DB_USER no puede estar vacio")
	}
	if c.DBPassword == "" {
		return fmt.Errorf("DB_PASSWORD no puede estar vacio")
	}
	if c.DBName == "" {
		return fmt.Errorf("DB_NAME no puede estar vacio")
	}
	if c.JWTSecret == "" || len(c.JWTSecret) < 32 {
		return fmt.Errorf("JWT_SECRET debe tener al menos 32 caracteres")
	}
	return nil
}
