package main

import (
	"log"
	"tradeoptix-back/internal/config"
	"tradeoptix-back/internal/database"
	"tradeoptix-back/internal/routes"

	"github.com/gin-gonic/gin"
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

	// Iniciar servidor
	log.Printf("Servidor iniciado en puerto %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatal("Error iniciando servidor:", err)
	}
}
