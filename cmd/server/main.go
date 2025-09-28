package main

import (
	"fmt"
	"log"
	"os"
	"tradeoptix-back/internal/config"
	"tradeoptix-back/internal/database"
	"tradeoptix-back/internal/routes"

	"github.com/gin-gonic/gin"
)

var (
	// Version se establece en tiempo de compilación
	Version = "dev"
	// BuildDate se establece en tiempo de compilación
	BuildDate = "unknown"
	// GitCommit se establece en tiempo de compilación
	GitCommit = "unknown"
)

// @title TradeOptix API
// @version 1.0
// @description Backend API para aplicación de inversión con registro de usuarios y KYC
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /api/v1
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Ingrese 'Bearer ' seguido del token JWT

func main() {
	// Verificar si se solicita información de versión
	if len(os.Args) > 1 && (os.Args[1] == "--version" || os.Args[1] == "-v") {
		fmt.Printf("TradeOptix Backend\n")
		fmt.Printf("Version: %s\n", Version)
		fmt.Printf("Build Date: %s\n", BuildDate)
		fmt.Printf("Git Commit: %s\n", GitCommit)
		return
	}

	// Cargar configuración
	cfg := config.Load()

	// Conectar a la base de datos
	db := database.Connect(cfg.DatabaseURL)
	defer db.Close()

	// Ejecutar migraciones
	if err := database.RunMigrations(cfg.DatabaseURL); err != nil {
		log.Fatal("Error ejecutando migraciones:", err)
	}

	// Configurar Gin
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// Configurar rutas
	routes.SetupRoutes(router, db)

	// Mostrar información de versión al iniciar
	log.Printf("TradeOptix Backend %s (Build: %s, Commit: %s)", Version, BuildDate, GitCommit)
	log.Printf("Servidor iniciado en puerto %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatal("Error iniciando servidor:", err)
	}
}
