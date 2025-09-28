package routes

import (
	"database/sql"
	"tradeoptix-back/internal/handlers"
	"tradeoptix-back/internal/middleware"
	"tradeoptix-back/internal/services"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func SetupRoutes(router *gin.Engine, db *sql.DB) {
	// Middleware global
	router.Use(middleware.CORS())
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// Configurar JWT secret (debe venir de config)
	jwtSecret := "your-super-secret-key-change-in-production"

	// Inicializar servicios
	userService := services.NewUserService(db, jwtSecret)
	kycService := services.NewKYCService(db, "uploads")

	// Inicializar handlers
	userHandler := handlers.NewUserHandler(userService)
	kycHandler := handlers.NewKYCHandler(kycService)
	adminHandler := handlers.NewAdminHandler(userService, kycService)

	// Documentación Swagger
	router.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Grupo de rutas API v1
	v1 := router.Group("/api/v1")
	{
		// Rutas públicas
		users := v1.Group("/users")
		{
			users.POST("/register", userHandler.RegisterUser)
			users.POST("/login", userHandler.LoginUser)
		}

		// Rutas protegidas (requieren autenticación)
		protected := v1.Group("/")
		protected.Use(middleware.JWTAuth(jwtSecret))
		{
			// Perfil de usuario
			protected.GET("/users/profile", userHandler.GetProfile)

			// KYC
			kyc := protected.Group("/kyc")
			{
				kyc.POST("/upload", kycHandler.UploadDocument)
				kyc.GET("/documents", kycHandler.GetUserDocuments)
				kyc.GET("/documents/:id/download", kycHandler.ServeDocument)
			}

			// Área administrativa (solo admins)
			admin := protected.Group("/admin")
			admin.Use(middleware.AdminAuth())
			{
				admin.GET("/users", adminHandler.GetAllUsers)
				admin.GET("/users/kyc", adminHandler.GetUsersByKYCStatus)
				admin.GET("/dashboard/stats", adminHandler.GetDashboardStats)
				admin.GET("/kyc/pending", adminHandler.GetPendingDocuments)
				admin.PUT("/kyc/:id/approve", adminHandler.ApproveDocument)
				admin.PUT("/kyc/:id/reject", adminHandler.RejectDocument)
			}
		}
	}

	// Ruta de health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "TradeOptix API funcionando correctamente",
		})
	})
}
