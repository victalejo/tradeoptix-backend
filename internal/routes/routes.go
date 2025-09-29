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

	// Servir archivos estáticos de uploads para administradores
	router.Static("/uploads", "./uploads")

	// Configurar JWT secret (debe venir de config)
	jwtSecret := "your-super-secret-key-change-in-production"

	// Inicializar servicios
	userService := services.NewUserService(db, jwtSecret)
	kycService := services.NewKYCService(db, "uploads")
	newsService := services.NewNewsService(db)
	notificationService := services.NewNotificationService(db)

	// Inicializar handlers
	userHandler := handlers.NewUserHandler(userService)
	kycHandler := handlers.NewKYCHandler(kycService)
	adminHandler := handlers.NewAdminHandler(userService, kycService)
	newsHandler := handlers.NewNewsHandler(newsService)
	notificationHandler := handlers.NewNotificationHandler(notificationService)

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

			// Noticias para usuarios
			news := protected.Group("/news")
			{
				news.GET("/latest", newsHandler.GetLatestNews)
				news.GET("/:id", newsHandler.GetNewsByID)
			}

			// Notificaciones para usuarios
			notifications := protected.Group("/notifications")
			{
				notifications.GET("/", notificationHandler.GetUserNotifications)
				notifications.GET("/unread-count", notificationHandler.GetUnreadCount)
				notifications.PUT("/:id/read", notificationHandler.MarkAsRead)
				notifications.PUT("/mark-all-read", notificationHandler.MarkAllAsRead)
				notifications.DELETE("/:id", notificationHandler.DeleteNotification)
			}

			// Área administrativa (solo admins)
			admin := protected.Group("/admin")
			admin.Use(middleware.AdminAuth())
			{
				// Usuarios
				admin.GET("/users", adminHandler.GetAllUsers)
				admin.GET("/users/kyc", adminHandler.GetUsersByKYCStatus)
				admin.GET("/dashboard/stats", adminHandler.GetDashboardStats)

				// KYC
				admin.GET("/kyc/pending", adminHandler.GetPendingDocuments)
				admin.GET("/kyc/documents/:id/preview", adminHandler.ServeDocument)
				admin.PUT("/kyc/:id/approve", adminHandler.ApproveDocument)
				admin.PUT("/kyc/:id/reject", adminHandler.RejectDocument)

				// Noticias (CRUD completo)
				adminNews := admin.Group("/news")
				{
					adminNews.POST("/", newsHandler.CreateNews)
					adminNews.GET("/", newsHandler.GetNews)
					adminNews.GET("/stats", newsHandler.GetNewsStats)
					adminNews.GET("/:id", newsHandler.GetNewsByID)
					adminNews.PUT("/:id", newsHandler.UpdateNews)
					adminNews.DELETE("/:id", newsHandler.DeleteNews)
				}

				// Notificaciones (gestión completa)
				adminNotifications := admin.Group("/notifications")
				{
					adminNotifications.POST("/", notificationHandler.CreateNotification)
					adminNotifications.GET("/", notificationHandler.GetAllNotifications)
					adminNotifications.GET("/stats", notificationHandler.GetNotificationStats)
					adminNotifications.POST("/cleanup", notificationHandler.CleanupExpired)
				}
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
