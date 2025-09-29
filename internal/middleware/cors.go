package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// CORSConfig configuración para CORS
type CORSConfig struct {
	AllowOrigins     []string
	AllowMethods     []string
	AllowHeaders     []string
	AllowCredentials bool
}

// DefaultCORSConfig configuración por defecto de CORS
func DefaultCORSConfig() *CORSConfig {
	// Obtener orígenes permitidos desde variable de entorno
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		// Configuración por defecto
		allowedOrigins = "http://localhost:3000,http://localhost:3004,http://localhost:8082,https://admin.tradeoptix.app,https://app.tradeoptix.app,https://tradeoptix.app"
	}

	origins := strings.Split(allowedOrigins, ",")

	return &CORSConfig{
		AllowOrigins: origins,
		AllowMethods: []string{
			"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS",
		},
		AllowHeaders: []string{
			"Content-Type", "Content-Length", "Accept-Encoding",
			"X-CSRF-Token", "Authorization", "accept", "origin",
			"Cache-Control", "X-Requested-With",
		},
		AllowCredentials: true,
	}
}

// NewCORS crea un middleware CORS con configuración personalizada
func NewCORS(config *CORSConfig) gin.HandlerFunc {
	if config == nil {
		config = DefaultCORSConfig()
	}

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// Verificar si el origen está permitido
		allowed := false
		for _, allowedOrigin := range config.AllowOrigins {
			if origin == allowedOrigin {
				allowed = true
				break
			}
		}

		// En desarrollo, permitir localhost dinámicamente
		if strings.HasPrefix(origin, "http://localhost:") || strings.HasPrefix(origin, "https://localhost:") {
			allowed = true
		}

		// Establecer headers CORS
		if allowed {
			c.Header("Access-Control-Allow-Origin", origin)
		} else if len(config.AllowOrigins) > 0 && config.AllowOrigins[0] == "*" {
			c.Header("Access-Control-Allow-Origin", "*")
		}

		if config.AllowCredentials {
			c.Header("Access-Control-Allow-Credentials", "true")
		}

		c.Header("Access-Control-Allow-Methods", strings.Join(config.AllowMethods, ", "))
		c.Header("Access-Control-Allow-Headers", strings.Join(config.AllowHeaders, ", "))

		// Manejar preflight requests
		if c.Request.Method == "OPTIONS" {
			c.Header("Access-Control-Max-Age", "86400") // 24 horas
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
