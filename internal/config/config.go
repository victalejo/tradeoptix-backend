package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	Environment string
	DatabaseURL string
	JWTSecret   string
}

func Load() *Config {
	// Determinar qué archivo .env cargar basado en el entorno
	envFile := ".env"
	if env := os.Getenv("ENVIRONMENT"); env != "" {
		envFile = ".env." + env
	}
	
	// Cargar variables de entorno desde el archivo correspondiente
	if err := godotenv.Load(envFile); err != nil {
		// Si no se encuentra el archivo específico, intentar cargar .env por defecto
		if err := godotenv.Load(); err != nil {
			log.Printf("Advertencia: No se pudo cargar archivo .env (%v), usando variables de entorno del sistema\n", err)
		} else {
			log.Println("Archivo .env cargado exitosamente")
		}
	} else {
		log.Printf("Archivo %s cargado exitosamente\n", envFile)
	}

	// Construir DatabaseURL a partir de variables individuales o usar DATABASE_URL directa
	databaseURL := getEnv("DATABASE_URL", "")
	if databaseURL == "" {
		// Si no hay DATABASE_URL, construirla a partir de variables individuales
		dbHost := getEnv("DB_HOST", "localhost")
		dbPort := getEnv("DB_PORT", "5432")
		dbUser := getEnv("DB_USER", "user")
		dbPassword := getEnv("DB_PASSWORD", "password")
		dbName := getEnv("DB_NAME", "tradeoptix")
		databaseURL = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", 
			dbUser, dbPassword, dbHost, dbPort, dbName)
	}

	return &Config{
		Port:        getEnv("PORT", "8080"),
		Environment: getEnv("ENVIRONMENT", "development"),
		DatabaseURL: databaseURL,
		JWTSecret:   getEnv("JWT_SECRET", "your-super-secret-key-change-in-production"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
